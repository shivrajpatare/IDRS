from api.routes import auth, phase, alerts, sos, facilities, citizen, command
from api.routes import resources, map as map_route, audit, reports, recovery, infra, exports, routing, notifications, analytics, simulation, risk, tactical_ai

def include_routers(app):
    app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
    app.include_router(phase.router, tags=["Phase"])
    app.include_router(alerts.router, prefix="/api/v1/alerts", tags=["Alerts"])
    app.include_router(sos.router, prefix="/api/v1/sos", tags=["SOS"])
    app.include_router(facilities.router, prefix="/api/v1/facilities", tags=["Facilities"])
    app.include_router(citizen.router, prefix="/api/v1/citizen", tags=["Citizen"])
    app.include_router(command.router, prefix="/api/v1/command", tags=["Command"])
    app.include_router(resources.router, prefix="/api/v1/resources", tags=["Resources"])
    app.include_router(map_route.router, prefix="/api/v1/map", tags=["Map"])
    app.include_router(audit.router, prefix="/api/v1/audit", tags=["Audit"])
    app.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports"])
    app.include_router(recovery.router, prefix="/api/v1/recovery", tags=["Recovery"])
    app.include_router(infra.router, prefix="/api/v1/infra-status", tags=["Infra"])
    app.include_router(exports.router, prefix="/api/v1/reports/export", tags=["Exports"])
    app.include_router(routing.router, prefix="/api/v1/routing", tags=["Routing"])
    app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["Notifications"])
    app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])
    app.include_router(simulation.router)
    app.include_router(risk.router)
    app.include_router(tactical_ai.router, prefix="/api/v1/tactical-ai", tags=["Tactical AI"])