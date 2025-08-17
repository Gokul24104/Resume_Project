import os
import uuid
import logging
import io
import pandas as pd
from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
import openai
from utils import (
    extract_resume_text,
    calculate_similarity,
    suggest_learning_resources,
    enhance_with_openai,
    extract_skills_ner
)

# -----------------------------
# Setup logging
# -----------------------------
logging.basicConfig(level=logging.INFO)
logging.getLogger("pdfminer").setLevel(logging.ERROR)

# -----------------------------
# Flask app setup
# -----------------------------
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'supersecretkey')
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# -----------------------------
# Allowed file types
# -----------------------------
ALLOWED_EXTENSIONS = {'pdf', 'docx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# -----------------------------
# CORS setup
# -----------------------------
CORS(app, resources={
    r"/*": {
        "origins": [
            "http://localhost:3000",
            "https://resume-project-red-gamma.vercel.app"
        ],
        "supports_credentials": True
    }
})

# -----------------------------
# OpenAI setup
# -----------------------------
openai.api_key = os.getenv("OPENAI_API_KEY")
if not openai.api_key:
    logging.warning("⚠️  OPENAI_API_KEY not set. OpenAI features will not work.")

# -----------------------------
# Routes
# -----------------------------
@app.route('/')
def home():
    return jsonify({'message': '✅ Welcome to the Resume Upload Service', 'status': 'running'})

@app.route('/health')
def health():
    return jsonify({'status': 'healthy'}), 200

# -----------------------------
# Upload single resume
# -----------------------------
@app.route('/upload', methods=['POST'])
def upload_resume():
    try:
        if 'resume' not in request.files:
            return jsonify({'error': 'No resume uploaded'}), 400

        file = request.files['resume']
        if file.filename == '':
            return jsonify({'error': 'No selected resume'}), 400

        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type'}), 400

        filename = f"{uuid.uuid4()}_{file.filename}"
        resume_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(resume_path)

        resume_text = extract_resume_text(resume_path)

        # Job description input
        jd_text = request.form.get('jd_text', '').strip()
        if 'jd_file' in request.files and request.files['jd_file'].filename:
            jd_file = request.files['jd_file']
            if allowed_file(jd_file.filename):
                jd_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{uuid.uuid4()}_{jd_file.filename}")
                jd_file.save(jd_path)
                jd_text = extract_resume_text(jd_path)

        if not jd_text:
            return jsonify({'error': 'No job description provided'}), 400

        match_score, resume_skills, jd_skills = calculate_similarity(resume_text, jd_text)
        missing_skills = [skill for skill in jd_skills if skill not in resume_skills]
        learning_suggestions = suggest_learning_resources(missing_skills)

        return jsonify({
            "message": "File uploaded and analyzed successfully!",
            "filename": filename,
            "match_score": match_score,
            "resume_skills": resume_skills,
            "jd_skills": jd_skills,
            "missing_skills": missing_skills,
            "learning_suggestions": learning_suggestions
        }), 200

    except Exception as e:
        logging.exception("Upload failed")
        return jsonify({'error': 'Upload failed: ' + str(e)}), 500

# -----------------------------
# Upload multiple resumes
# -----------------------------
@app.route('/upload_bulk', methods=['POST'])
def upload_bulk_resumes():
    try:
        jd_text = request.form.get('jd_text', '').strip()
        if 'jd_file' in request.files and request.files['jd_file'].filename:
            jd_file = request.files['jd_file']
            if allowed_file(jd_file.filename):
                jd_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{uuid.uuid4()}_{jd_file.filename}")
                jd_file.save(jd_path)
                jd_text = extract_resume_text(jd_path)

        if not jd_text:
            return jsonify({'error': 'No job description provided'}), 400

        jd_skills = extract_skills_ner(jd_text)
        resumes = request.files.getlist('resumes')
        if not resumes:
            return jsonify({'error': 'No resumes uploaded'}), 400

        results = []

        for file in resumes:
            if not allowed_file(file.filename):
                continue
            filename = f"{uuid.uuid4()}_{file.filename}"
            resume_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(resume_path)

            resume_text = extract_resume_text(resume_path)
            resume_skills = extract_skills_ner(resume_text)
            matched_skills = [s for s in jd_skills if s in resume_skills]
            match_score = round((len(matched_skills) / len(jd_skills)) * 100, 2) if jd_skills else 0
            missing_skills = [s for s in jd_skills if s not in resume_skills]

            results.append({
                "filename": filename,
                "match_score": match_score,
                "resume_skills": resume_skills,
                "missing_skills": missing_skills
            })

        results_sorted = sorted(results, key=lambda x: x['match_score'], reverse=True)
        return jsonify({
            'jd_skills': jd_skills,
            'results': results_sorted
        }), 200

    except Exception as e:
        logging.exception("Bulk upload failed")
        return jsonify({'error': 'Bulk upload failed: ' + str(e)}), 500

# -----------------------------
# Download uploaded file
# -----------------------------
@app.route('/uploads/<path:filename>')
def download_resume(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename, as_attachment=True)

# -----------------------------
# Download PDF report
# -----------------------------
@app.route('/download_report', methods=['POST'])
def download_report():
    try:
        data = request.get_json()
        results = data.get('results', [])

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()

        elements.append(Paragraph("Resume Screening Report", styles['Title']))
        elements.append(Spacer(1, 12))

        table_data = [["Resume", "Match Score (%)"]]
        for res in results:
            table_data.append([res['filename'], f"{res['match_score']}"])

        t = Table(table_data, hAlign='LEFT')
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.lightblue),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (-1,0), 12),
            ('BACKGROUND', (0,1), (-1,-1), colors.beige),
            ('GRID', (0,0), (-1,-1), 1, colors.black),
        ]))
        elements.append(t)

        doc.build(elements)
        buffer.seek(0)
        return send_file(buffer, as_attachment=True, download_name="resume_report.pdf", mimetype='application/pdf')

    except Exception as e:
        logging.exception("Report generation failed")
        return jsonify({'error': 'Report generation failed: ' + str(e)}), 500

# -----------------------------
# Download Excel report
# -----------------------------
@app.route('/download_report_excel', methods=['POST'])
def download_report_excel():
    try:
        data = request.get_json()
        results = data.get('results', [])

        rows = []
        for res in results:
            rows.append({
                "Resume": res['filename'],
                "Match Score (%)": res['match_score'],
            })

        df = pd.DataFrame(rows)
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Summary')
        output.seek(0)
        return send_file(output, as_attachment=True, download_name="resume_report.xlsx", 
                         mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

    except Exception as e:
        logging.exception("Excel report generation failed")
        return jsonify({'error': 'Excel report generation failed: ' + str(e)}), 500

# -----------------------------
# Enhance resume with OpenAI
# -----------------------------
@app.route('/enhance_resume', methods=['POST'])
def enhance_resume():
    try:
        data = request.get_json()
        resume_text = data.get('resume_text', '')
        job_descriptions = data.get('job_descriptions', '')

        if not resume_text:
            return jsonify({"error": "Resume text is required"}), 400

        enhanced_feedback = enhance_with_openai(resume_text, job_descriptions)
        return jsonify({"enhanced_feedback": enhanced_feedback})

    except Exception as e:
        logging.exception("Enhancement failed")
        return jsonify({'error': 'Enhancement failed: ' + str(e)}), 500

# -----------------------------
# Test NER
# -----------------------------
@app.route('/test_ner', methods=['POST'])
def test_ner():
    try:
        data = request.get_json()
        text = data.get('text', '')
        skills = extract_skills_ner(text)
        return jsonify({'extracted_skills': skills})

    except Exception as e:
        logging.exception("NER test failed")
        return jsonify({'error': 'NER test failed: ' + str(e)}), 500

# -----------------------------
# Run app
# -----------------------------
if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
