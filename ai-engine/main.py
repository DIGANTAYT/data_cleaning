from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import sqlite3
import os
import json
from dotenv import load_dotenv
from cleaner import detect_issues, apply_cleaning
from copilot import ask_copilot
from ml_engine import train_auto_model

load_dotenv()

app = FastAPI(title="Data Cleaning AI Engine API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProfileRequest(BaseModel):
    datasetId: str
    filePath: str

def profile_dataset_task(dataset_id: str, file_path: str):
    try:
        # Resolve absolute path relative to the backend directory
        abs_file_path = os.path.join(os.path.dirname(__file__), "..", "backend", file_path)
        
        # Determine file type and read
        if abs_file_path.endswith('.csv'):
            df = pd.read_csv(abs_file_path)
        elif abs_file_path.endswith('.json'):
            df = pd.read_json(abs_file_path)
        elif abs_file_path.endswith('.xlsx') or abs_file_path.endswith('.xls'):
            df = pd.read_excel(abs_file_path)
        else:
            raise ValueError("Unsupported file format")

        row_count = int(df.shape[0])
        col_count = int(df.shape[1])
        
        # Profile info (schema, nulls, types) could be saved to DatasetVersion changes
        # For now, let's just update the status to READY and save row count
        
        db_path = os.path.join(os.path.dirname(__file__), "..", "backend", "dev.db")
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute("UPDATE Dataset SET rowCount = ?, status = ? WHERE id = ?", (row_count, 'READY', dataset_id))
        conn.commit()
        conn.close()
        
        print(f"Successfully profiled dataset {dataset_id}: {row_count} rows, {col_count} columns.")
        
    except Exception as e:
        print(f"Error profiling dataset {dataset_id}: {e}")
        db_path = os.path.join(os.path.dirname(__file__), "..", "backend", "dev.db")
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("UPDATE Dataset SET status = ? WHERE id = ?", ('FAILED', dataset_id))
        conn.commit()
        conn.close()

@app.post("/api/profile")
def profile_dataset(request: ProfileRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(profile_dataset_task, request.datasetId, request.filePath)
    return {"message": "Profiling started in the background"}

class AnalyzeRequest(BaseModel):
    filePath: str

@app.post("/api/detect-issues")
def detect_dataset_issues(request: AnalyzeRequest):
    abs_file_path = os.path.join(os.path.dirname(__file__), "..", "backend", request.filePath)
    try:
        if abs_file_path.endswith('.csv'):
            df = pd.read_csv(abs_file_path)
        elif abs_file_path.endswith('.json'):
            df = pd.read_json(abs_file_path)
        else:
            df = pd.read_excel(abs_file_path)
            
        issues = detect_issues(df)
        
        # Get all rows of the data for preview
        preview = df.fillna("").to_dict(orient="records")
        columns = list(df.columns)
        
        return {"issues": issues, "preview": preview, "columns": columns, "rowCount": len(df)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class CleanRequest(BaseModel):
    datasetId: str
    filePath: str
    operations: list

@app.post("/api/clean")
def clean_dataset(request: CleanRequest):
    abs_file_path = os.path.join(os.path.dirname(__file__), "..", "backend", request.filePath)
    try:
        if abs_file_path.endswith('.csv'):
            df = pd.read_csv(abs_file_path)
        elif abs_file_path.endswith('.json'):
            df = pd.read_json(abs_file_path)
        else:
            df = pd.read_excel(abs_file_path)
            
        cleaned_df = apply_cleaning(df, request.operations)
        
        # Save new version
        new_file_name = f"cleaned_{os.path.basename(abs_file_path)}"
        new_file_path = os.path.join(os.path.dirname(abs_file_path), new_file_name)
        
        if new_file_path.endswith('.csv'):
            cleaned_df.to_csv(new_file_path, index=False)
        elif new_file_path.endswith('.json'):
            cleaned_df.to_json(new_file_path, orient="records")
        else:
            cleaned_df.to_excel(new_file_path, index=False)
            
        # Update Database
        db_path = os.path.join(os.path.dirname(__file__), "..", "backend", "dev.db")
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Insert DatasetVersion
        cursor.execute("SELECT IFNULL(MAX(version), 0) + 1 FROM DatasetVersion WHERE datasetId = ?", (request.datasetId,))
        version = cursor.fetchone()[0]
        
        cursor.execute(
            "INSERT INTO DatasetVersion (id, datasetId, version, filePath, changes, createdAt) VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?, datetime('now'))",
            (request.datasetId, version, f"uploads/{new_file_name}", json.dumps(request.operations))
        )
        
        # Update main dataset record to point to new file and row count
        cursor.execute("UPDATE Dataset SET filePath = ?, rowCount = ? WHERE id = ?", (f"uploads/{new_file_name}", len(cleaned_df), request.datasetId))
        
        conn.commit()
        conn.close()
        
        return {"message": "Dataset cleaned successfully", "newFilePath": f"uploads/{new_file_name}", "rowCount": len(cleaned_df)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class CopilotRequest(BaseModel):
    filePath: str
    query: str
    apiKey: str = None

@app.post("/api/copilot")
def copilot_chat(request: CopilotRequest):
    abs_file_path = os.path.join(os.path.dirname(__file__), "..", "backend", request.filePath)
    try:
        if abs_file_path.endswith('.csv'):
            df = pd.read_csv(abs_file_path)
        elif abs_file_path.endswith('.json'):
            df = pd.read_json(abs_file_path)
        else:
            df = pd.read_excel(abs_file_path)
            
        answer = ask_copilot(df, request.query, request.apiKey)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class TrainRequest(BaseModel):
    filePath: str
    targetColumn: str

@app.post("/api/train")
def train_model_endpoint(request: TrainRequest):
    abs_file_path = os.path.join(os.path.dirname(__file__), "..", "backend", request.filePath)
    try:
        if abs_file_path.endswith('.csv'):
            df = pd.read_csv(abs_file_path)
        elif abs_file_path.endswith('.json'):
            df = pd.read_json(abs_file_path)
        else:
            df = pd.read_excel(abs_file_path)
            
        result = train_auto_model(df, request.targetColumn)
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-engine"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
