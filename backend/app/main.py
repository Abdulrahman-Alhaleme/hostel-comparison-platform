from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, hostels, compare, analysis

app = FastAPI(title="Hostel Comparison Platform API")

origins = [
    "http://localhost:5173", # Vite default
    "http://localhost:5174", # Vite alternate
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(hostels.router, prefix="/api/hostels", tags=["Hostels"])
app.include_router(compare.router, prefix="/api/compare", tags=["Compare"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Hostel Comparison API"}
