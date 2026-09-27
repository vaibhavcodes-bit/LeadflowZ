from fastapi import FastAPI

from app.api.routes.leads import router as leads_router
from app.api.routes.webhook import router as webhook_router
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "service": settings.app_name,
    }


app.include_router(
    leads_router,
    prefix=settings.api_prefix,
)

app.include_router(
    webhook_router,
    prefix=settings.api_prefix,
)