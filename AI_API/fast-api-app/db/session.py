from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError

import socket
from urllib.parse import urlparse, urlunparse

from core.config import settings


def _make_engine(url: str):
    connect_args = {}
    if url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
    return create_engine(url, connect_args=connect_args, pool_pre_ping=True)


if not settings.DATABASE_URL:
    raise ValueError(
        "DATABASE_URL is not configured. Set DATABASE_URL/SUPABASE_DB_URL or DB_HOST + DB_PASSWORD in environment variables."
    )

engine = None
try:
    engine = _make_engine(settings.DATABASE_URL)
    # Try a quick connection to fail fast if DNS/route is broken
    with engine.connect() as _:
        pass
except OperationalError as oe:
    # If hostname resolution failed, try resolving IPv4 and retry using the IP literal
    msg = str(oe).lower()
    if "could not translate host name" in msg or "name or service not known" in msg or "temporary failure in name resolution" in msg:
        parsed = urlparse(settings.DATABASE_URL)
        host = parsed.hostname
        try:
            addrs = socket.getaddrinfo(host, None, socket.AF_INET)
            if addrs:
                ipv4 = addrs[0][4][0]
                # replace hostname with IPv4 address
                netloc = parsed.netloc.replace(host, ipv4)
                new_parsed = parsed._replace(netloc=netloc)
                new_url = urlunparse(new_parsed)
                engine = _make_engine(new_url)
            else:
                raise
        except Exception:
            # Try IPv6 literal if IPv4 resolution failed
            try:
                addrs6 = socket.getaddrinfo(host, None, socket.AF_INET6)
                if addrs6:
                    ipv6 = addrs6[0][4][0]
                    # IPv6 literal must be wrapped in brackets in a URL
                    netloc = parsed.netloc.replace(host, f"[{ipv6}]")
                    new_parsed = parsed._replace(netloc=netloc)
                    new_url = urlunparse(new_parsed)
                    engine = _make_engine(new_url)
                else:
                    raise RuntimeError(
                        "Hostname resolved to no A or AAAA records from this machine."
                    )
            except Exception:
                raise RuntimeError(
                    "Failed to resolve host to IPv4 or IPv6 on this machine. "
                    "Recommend using Supabase 'pooled' connection URI (Project → Settings → Database → Connection string → URI (connection pooler))."
                )
    else:
        raise


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
