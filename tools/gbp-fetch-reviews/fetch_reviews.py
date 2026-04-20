"""
Export all Google reviews for a Business Profile location using the
Google Business Profile (My Business) API v4.

Prerequisites (Google-side):
  - Submit access for Business Profile APIs and get project approval:
    https://developers.google.com/my-business/content/prereqs
  - Enable the Business Profile / My Business APIs on your GCP project:
    https://developers.google.com/my-business/content/basic-setup
  - OAuth consent screen + OAuth client (Desktop app recommended).
  - Scope: https://www.googleapis.com/auth/business.manage

First run opens a browser to authorize; token is saved for later runs.

Usage examples:
  python fetch_reviews.py --credentials path/to/client_secret.json
  python fetch_reviews.py --credentials client.json --match-title "Lopez Giacomelli"
  python fetch_reviews.py --credentials client.json --parent accounts/123/locations/456
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from typing import Any, Dict, Iterable, List, Optional

import requests
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ["https://www.googleapis.com/auth/business.manage"]
ACCOUNT_MGMT_BASE = "https://mybusinessaccountmanagement.googleapis.com/v1"
MYBUSINESS_V4_BASE = "https://mybusiness.googleapis.com/v4"


def load_credentials(client_secrets_path: str, token_path: str) -> Credentials:
    creds: Optional[Credentials] = None
    if os.path.isfile(token_path):
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(client_secrets_path, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(token_path, "w", encoding="utf-8") as f:
            f.write(creds.to_json())
    return creds


def authed_get(creds: Credentials, url: str, params: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
    if not creds.valid:
        creds.refresh(Request())
    r = requests.get(
        url,
        params=params or {},
        headers={"Authorization": f"Bearer {creds.token}"},
        timeout=120,
    )
    if r.status_code >= 400:
        raise RuntimeError(f"HTTP {r.status_code} for {url}: {r.text}")
    return r.json()


def list_all_accounts(creds: Credentials) -> List[Dict[str, Any]]:
    accounts: List[Dict[str, Any]] = []
    url = f"{ACCOUNT_MGMT_BASE}/accounts"
    page_token: Optional[str] = None
    while True:
        params: Dict[str, str] = {}
        if page_token:
            params["pageToken"] = page_token
        data = authed_get(creds, url, params)
        accounts.extend(data.get("accounts") or [])
        page_token = data.get("nextPageToken")
        if not page_token:
            break
    return accounts


def list_all_locations(creds: Credentials, account_name: str) -> List[Dict[str, Any]]:
    """account_name is e.g. accounts/123456789."""
    locations: List[Dict[str, Any]] = []
    url = f"{MYBUSINESS_V4_BASE}/{account_name}/locations"
    page_token: Optional[str] = None
    while True:
        params: Dict[str, str] = {"pageSize": "100"}
        if page_token:
            params["pageToken"] = page_token
        data = authed_get(creds, url, params)
        locations.extend(data.get("locations") or [])
        page_token = data.get("nextPageToken")
        if not page_token:
            break
    return locations


def pick_location(
    locations: Iterable[Dict[str, Any]],
    match_title: Optional[str],
    parent: Optional[str],
) -> Dict[str, Any]:
    locs = list(locations)
    if parent:
        for loc in locs:
            if loc.get("name") == parent:
                return loc
        raise SystemExit(f"No location with name == {parent!r}. Try listing without --parent.")

    if not locs:
        raise SystemExit("No locations returned for this account.")

    if match_title:
        needle = match_title.casefold()
        matches = []
        for loc in locs:
            title = (loc.get("locationName") or loc.get("title") or "").casefold()
            if needle in title:
                matches.append(loc)
        if len(matches) == 1:
            return matches[0]
        if not matches:
            raise SystemExit(f"No location title contained {match_title!r}.")
        raise SystemExit(
            f"Multiple locations matched {match_title!r}: "
            + ", ".join(repr(loc.get("locationName") or loc.get("title")) for loc in matches)
            + ". Pass --parent with the full `accounts/.../locations/...` name."
        )

    if len(locs) == 1:
        return locs[0]

    raise SystemExit(
        "Multiple locations found; specify --match-title or --parent.\n"
        + "\n".join(
            f"  {loc.get('name')}: {loc.get('locationName') or loc.get('title') or '(no title)'}" for loc in locs
        )
    )


def list_all_reviews(creds: Credentials, location_name: str) -> tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """location_name is accounts/.../locations/..."""
    reviews: List[Dict[str, Any]] = []
    summary: Dict[str, Any] = {}
    url = f"{MYBUSINESS_V4_BASE}/{location_name}/reviews"
    page_token: Optional[str] = None
    while True:
        params: Dict[str, str] = {"pageSize": "50"}
        if page_token:
            params["pageToken"] = page_token
        data = authed_get(creds, url, params)
        if not summary:
            for key in ("averageRating", "totalReviewCount"):
                if key in data:
                    summary[key] = data[key]
        reviews.extend(data.get("reviews") or [])
        page_token = data.get("nextPageToken")
        if not page_token:
            break
    return reviews, summary


def main() -> None:
    parser = argparse.ArgumentParser(description="Fetch all GBP reviews for one location.")
    parser.add_argument(
        "--credentials",
        required=True,
        help="Path to OAuth client JSON (Desktop app type from Google Cloud Console).",
    )
    parser.add_argument(
        "--token",
        default=os.path.join(os.path.dirname(__file__), "token.json"),
        help="Path to store OAuth user token (default: alongside this script).",
    )
    parser.add_argument(
        "--account",
        help="Account resource name, e.g. accounts/123. If omitted, uses the first returned account.",
    )
    parser.add_argument(
        "--parent",
        help="Full location resource name accounts/{aid}/locations/{lid}. Skips discovery.",
    )
    parser.add_argument(
        "--match-title",
        help="Substring to match against location title (case-insensitive) when choosing among locations.",
    )
    parser.add_argument(
        "--list-only",
        action="store_true",
        help="Only print accounts and locations, then exit.",
    )
    parser.add_argument(
        "--output",
        help="Write full JSON (reviews + metadata) to this file.",
    )
    args = parser.parse_args()

    if not os.path.isfile(args.credentials):
        sys.exit(f"Credentials file not found: {args.credentials}")

    creds = load_credentials(args.credentials, args.token)

    if args.parent:
        location_name = args.parent
        location_summary = {"name": location_name}
        if args.list_only:
            print(json.dumps({"location": location_summary}, indent=2, ensure_ascii=False))
            return
    else:
        accounts = list_all_accounts(creds)
        if not accounts:
            sys.exit("No accounts returned. Check API access and that you signed in as a profile manager.")

        account_name = args.account
        if not account_name:
            account_name = accounts[0]["name"]
            if len(accounts) > 1 and not args.list_only:
                print(
                    "Multiple accounts; using the first. Pass --account to pick another:\n"
                    + "\n".join(f"  {a.get('name')}: {a.get('accountName')}" for a in accounts),
                    file=sys.stderr,
                )

        locations = list_all_locations(creds, account_name)
        if args.list_only:
            print(json.dumps({"account": account_name, "locations": locations}, indent=2, ensure_ascii=False))
            return

        loc = pick_location(locations, args.match_title, None)
        location_name = loc["name"]
        location_summary = {
            "name": loc.get("name"),
            "title": loc.get("locationName") or loc.get("title"),
            "storeCode": loc.get("storeCode"),
        }

    reviews, review_page_summary = list_all_reviews(creds, location_name)
    payload = {
        "location": location_summary,
        "averageRating": review_page_summary.get("averageRating"),
        "totalReviewCount": review_page_summary.get("totalReviewCount", len(reviews)),
        "fetchedReviewCount": len(reviews),
        "reviews": reviews,
    }

    text = json.dumps(payload, indent=2, ensure_ascii=False)
    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(text)
        print(f"Wrote {len(reviews)} reviews to {args.output}")
    else:
        print(text)


if __name__ == "__main__":
    main()
