def normalize_severity(raw_severity: str) -> str:
    """
    Maps SACHET/IMD raw severity strings to IDRS standardized levels.
    Levels: Critical, Severe, Moderate, Advisory, Info
    """
    s = str(raw_severity).lower()
    
    if any(x in s for x in ['extreme', 'critical', 'red']):
        return 'Critical'
    if any(x in s for x in ['severe', 'orange']):
        return 'Severe'
    if any(x in s for x in ['moderate', 'yellow']):
        return 'Moderate'
    if any(x in s for x in ['minor', 'green', 'advisory']):
        return 'Advisory'
    
    return 'Info'
