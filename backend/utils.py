import os
import re
import openai
from pdfminer.high_level import extract_text as extract_pdf_text
import docx2txt
import spacy
from spacy.pipeline import EntityRuler
from learning_resources import learning_links
from collections import defaultdict

# -------------------------------
# Skill Keywords for NER
# -------------------------------
skills_keywords = [
    # Programming & Web
    "python", "java", "c", "c++", "c#", "javascript", "typescript", "go", "ruby", "swift", "kotlin", "rust", "php", "perl", "r", "scala",
    "html", "css", "sass", "bootstrap", "tailwind", "react.js", "angular", "vue.js", "node.js", "next.js", "express.js",

    # Backend & Frameworks
    "django", "flask", "fastapi", "spring", "springboot", "rest api", "graphql", "asp.net",

    # Mobile
    "android", "ios", "react native", "flutter", "xamarin", "electron",

    # Databases
    "mysql", "postgresql", "mongodb", "sqlite", "firebase", "oracle", "redis", "sql", "nosql",

    # DevOps & Cloud
    "docker", "kubernetes", "aws", "azure", "gcp", "heroku", "netlify", "cloud", "jenkins", "github actions", "ci/cd",

    # Tools
    "git", "github", "gitlab", "bitbucket", "jira", "postman", "vs code", "intellij", "pycharm",

    # Data Science & AI
    "numpy", "pandas", "matplotlib", "seaborn", "scikit-learn", "tensorflow", "keras", "pytorch", "openai", "huggingface",
    "machine learning", "deep learning", "nlp", "data analysis",

    # System & Scripting
    "unix", "linux", "bash", "api", "oop", "mvc", "unit testing", "integration testing",

    # Soft Skills
    "communication", "teamwork", "problem-solving", "leadership", "collaboration", "adaptability", "critical thinking",
    "time management", "attention to detail", "learning", "creativity", "decision making", "conflict resolution", "empathy",

    # Electrical & ECE
    "vlsi", "verilog", "embedded systems", "matlab", "ltspice", "fpga", "arm cortex", "arduino", "raspberry pi", "digital electronics",
    "analog electronics", "control systems", "signal processing", "microcontrollers", "microprocessors", "iot", "pcb design",
    "proteus", "cadence", "multisim",

    # Mechanical
    "autocad", "solidworks", "catia", "ansys", "creo", "nx cad", "mechanics", "thermodynamics", "fluid mechanics",
    "finite element analysis", "3d modeling", "machine design", "hvac", "mechatronics",

    # Civil
    "staad pro", "etabs", "autocad civil", "primavera", "revit", "surveying", "structural analysis", "construction planning",
    "estimation and costing", "soil mechanics", "transportation engineering", "geotechnical engineering",

    # Biotech / Biomedical
    "biochemistry", "molecular biology", "genetics", "cell culture", "bioinformatics", "clinical research", "lab techniques",
    "pharmacology", "medical devices", "biomedical instrumentation", "protein purification", "microscopy",

    # General Science & Research
    "research methodology", "data collection", "hypothesis testing", "statistical analysis", "simulation", "scientific writing",

    # Business / Management
    "excel", "powerpoint", "project management", "agile", "scrum", "kanban", "business analysis", "marketing", "sales",
    "finance", "budgeting", "operations management", "hr management", "ms office"
]

# -------------------------------
# Text Extraction
# -------------------------------
def extract_resume_text(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".pdf":
        return extract_pdf_text(file_path)
    elif ext == ".docx":
        return docx2txt.process(file_path)
    else:
        return ""

# -------------------------------
# Initialize spaCy NER + EntityRuler
# -------------------------------
nlp = spacy.load("en_core_web_sm")
ruler = nlp.add_pipe("entity_ruler", before="ner")
skill_patterns = [{"label": "SKILL", "pattern": skill} for skill in skills_keywords]
ruler.add_patterns(skill_patterns)

# -------------------------------
# Skill Extraction (NER-based only)
# -------------------------------
def extract_skills_ner(text):
    doc = nlp(text.lower())
    entities_by_label = defaultdict(set)
    for ent in doc.ents:
        entities_by_label[ent.label_].add(ent.text.strip())

    skills = sorted(entities_by_label.get("SKILL", []))

    # Print extracted SKILL entities cleanly
    #print("Extracted SKILL entities:", skills)

    return skills


# -------------------------------
# Similarity Calculation
# -------------------------------
def calculate_similarity(resume_text, jd_text):
    resume_skills = extract_skills_ner(resume_text)
    jd_skills = extract_skills_ner(jd_text)
    matched_skills = [skill for skill in jd_skills if skill in resume_skills]
    match_score = round((len(matched_skills) / len(jd_skills)) * 100, 2) if jd_skills else 0
    return match_score, resume_skills, jd_skills

# -------------------------------
# Learning Resource Suggestion
# -------------------------------
def suggest_learning_resources(missing_skills):
    return {
        skill: learning_links[skill]
        for skill in missing_skills
        if skill in learning_links
    }

# -------------------------------
# AI Resume Enhancer
# -------------------------------
def enhance_with_openai(resume_text, job_descriptions):
    try:
        prompt = (
            "You are an expert career advisor. Review the following resume and job description.\n\n"
            f"Resume:\n{resume_text}\n\n"
            f"Job Description:\n{job_descriptions}\n\n"
            "Provide constructive feedback on how the resume can be improved to better match the job. "
            "Highlight missing skills, suggest phrasing improvements, and recommend keywords to add."
        )

        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful career coach."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.7,
        )

        feedback = response.choices[0].message['content'].strip()
        return feedback

    except Exception as e:
        print(f"Error during OpenAI call: {e}")
        return "Sorry, the AI enhancement service is currently unavailable. Please try again later."
