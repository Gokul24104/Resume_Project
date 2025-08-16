import os
import json
from flask import Flask, request, jsonify, send_from_directory, send_file
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
import io
import pandas as pd
from flask_cors import CORS
import openai
from utils import (
    extract_resume_text,
    calculate_similarity,
    suggest_learning_resources,
    enhance_with_openai,
    extract_skills_ner
)
import logging

# Suppress PDFMiner logs
logging.getLogger("pdfminer").setLevel(logging.ERROR)

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'supersecretkey')

# ✅ CORS setup: Allow only your Vercel frontend
CORS(app, supports_credentials=True, origins=[
    "https://resume-project-git-master-gokuls-projects-887a247b.vercel.app",
    "https://resume-project-ge0n09tka-gokuls-projects-887a247b.vercel.app"
])

openai.api_key = os.getenv("OPENAI_API_KEY")
if not openai.api_key:
    raise ValueError("OPENAI_API_KEY environment variable not set.")

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route('/')
def home():
    return '✅ Welcome to the Resume Upload Service'

@app.route('/upload', methods=['POST'])
def upload_resume():
    try:
        if 'resume' not in request.files:
            return jsonify({'error': 'No resume uploaded'}), 400

        file = request.files['resume']
        if file.filename == '':
            return jsonify({'error': 'No selected resume'}), 400

        resume_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(resume_path)

        resume_text = extract_resume_text(resume_path)

        jd_text = request.form.get('jd_text', '').strip()

        if 'jd_file' in request.files and request.files['jd_file'].filename:
            jd_file = request.files['jd_file']
            jd_path = os.path.join(app.config['UPLOAD_FOLDER'], jd_file.filename)
            jd_file.save(jd_path)
            jd_text = extract_resume_text(jd_path)

        if not jd_text:
            return jsonify({'error': 'No job description provided'}), 400

        match_score, resume_skills, jd_skills = calculate_similarity(resume_text, jd_text)
        missing_skills = [skill for skill in jd_skills if skill not in resume_skills]
        learning_suggestions = suggest_learning_resources(missing_skills)

        return jsonify({
            "message": "File uploaded and analyzed successfully!",
            "filename": file.filename,
            "match_score": match_score,
            "resume_skills": resume_skills,
            "jd_skills": jd_skills,
            "missing_skills": missing_skills,
            "learning_suggestions": learning_suggestions
        }), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Upload failed: ' + str(e)}), 500

@app.route('/upload_bulk', methods=['POST'])
def upload_bulk_resumes():
    jd_text = request.form.get('jd_text', '').strip()
    if 'jd_file' in request.files and request.files['jd_file'].filename:
        jd_file = request.files['jd_file']
        jd_path = os.path.join(app.config['UPLOAD_FOLDER'], jd_file.filename)
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
        filename = file.filename
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

@app.route('/uploads/<path:filename>')
def download_resume(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename, as_attachment=True)

@app.route('/download_report', methods=['POST'])
def download_report():
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

@app.route('/download_report_excel', methods=['POST'])
def download_report_excel():
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
    return send_file(output, as_attachment=True, download_name="resume_report.xlsx", mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

@app.route('/enhance_resume', methods=['POST'])
def enhance_resume():
    data = request.get_json()
    resume_text = data.get('resume_text', '')
    job_descriptions = data.get('job_descriptions', '')

    if not resume_text:
        return jsonify({"error": "Resume text is required"}), 400

    enhanced_feedback = enhance_with_openai(resume_text, job_descriptions)
    return jsonify({"enhanced_feedback": enhanced_feedback})

@app.route('/test_ner', methods=['POST'])
def test_ner():
    data = request.get_json()
    text = data.get('text', '')
    skills = extract_skills_ner(text)
    return jsonify({'extracted_skills': skills})

if __name__ == '__main__':
    app.run(debug=True)