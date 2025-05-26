import time
import logging

def retry_with_backoff(fn, max_retries=5, delay=5, logger=logging):
    for attempt in range(1, max_retries + 1):
        try:
            return fn()
        except Exception as e:
            logger.error(f"Virhe: {e}. Yritys {attempt}/{max_retries}")
            if attempt == max_retries:
                logger.warning("Maksimimäärä yrityksiä saavutettu.")
                raise
            time.sleep(delay)
