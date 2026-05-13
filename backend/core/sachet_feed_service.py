import httpx
import logging
import xml.etree.ElementTree as ET

logger = logging.getLogger(__name__)

# Fallback to RSS feed if the JSON index is not available
RSS_FEED_URL = "https://sachet.ndma.gov.in/CapFeed"

async def fetch_alert_identifiers():
    """
    Fetches the list of active alert identifiers from the SACHET RSS feed.
    """
    try:
        async with httpx.AsyncClient(verify=False) as client:
            headers = {"User-Agent": "Mozilla/5.0"}
            response = await client.get(RSS_FEED_URL, timeout=15.0, headers=headers)
            
            if response.status_code == 200:
                # RSS Parsing
                root = ET.fromstring(response.text)
                identifiers = []
                
                # In SACHET RSS, the <link> usually contains the identifier 
                # or there's a specific CAP field. 
                # Typical pattern: <guid> or <link>.../FetchXMLFile?identifier=XYZ
                for item in root.findall(".//item"):
                    guid = item.findtext("guid")
                    link = item.findtext("link")
                    
                    # Try to extract ID from link if it's a URL
                    if link and "identifier=" in link:
                        id_val = link.split("identifier=")[-1]
                        identifiers.append(id_val)
                    elif guid:
                        identifiers.append(guid)
                
                # If nothing found, try standard <identifier> tag in case it's a CAP feed
                if not identifiers:
                    for entry in root.findall(".//identifier"):
                        identifiers.append(entry.text)
                
                return list(set(identifiers)) # Unique IDs
            else:
                logger.error(f"Failed to fetch SACHET RSS feed: HTTP {response.status_code}")
                
    except Exception as e:
        logger.error(f"SACHET Feed Service Error: {e}")
        
    return []
