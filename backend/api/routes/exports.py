from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from models.database import get_db
import io
from reportlab.pdfgen import canvas

router = APIRouter()

@router.get("/pdf")
def export_pdf(db: Session = Depends(get_db)):
    # Mock PDF generation
    output = io.BytesIO()
    p = canvas.Canvas(output)
    p.drawString(100, 800, "IDRS Post-Incident Report")
    p.drawString(100, 780, "Phase: POST_DISASTER")
    p.drawString(100, 760, "Summary: The incident response was effectively managed.")
    p.showPage()
    p.save()
    
    pdf_out = output.getvalue()
    output.close()
    
    return Response(content=pdf_out, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=report.pdf"})

@router.get("/csv")
def export_csv(db: Session = Depends(get_db)):
    # Mock CSV
    csv_data = "id,status,score\n1,resolved,4.5\n2,assigned,3.2\n"
    return Response(content=csv_data, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=export.csv"})
