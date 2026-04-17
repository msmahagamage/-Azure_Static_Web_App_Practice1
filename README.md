# Florida Flood Monitoring & Early Warning System

A responsive web application for the Florida Flood Monitoring ArcGIS Dashboard and displays a **live active flood count** fetched directly from the ArcGIS Feature Layer REST API.

---

##  Project Structure

```
florida-flood-monitor/
│
├── index.html      ← Page structure (HTML only, no inline JS or CSS)
├── style.css       ← All visual styling
├── app.js          ← All live data logic (ArcGIS API fetch)
└── README.md       ← This file
```

---


##  ArcGIS Data Source

| Property      | Value                                      |
|---------------|--------------------------------------------|
| Organisation  | University of Alabama (`ts4gk3YgS68yLGFl`) |
| Layer name    | Florida Flood Warning Areas view           |
| Dashboard ID  | `b42516ab0a3b463b9b6aea9d32cd30ef`         |
| REST endpoint | `FeatureServer/0/query`                    |

### Fields used

| Field name    | Type   | Used for                             |
|---------------|--------|--------------------------------------|
| `Status`      | String | Filter: `Active` / `Inactive` / `Expired` |
| `severity`    | String | Breakdown: `High` / `Medium` / `Low` |
| `UpdateDate`  | Date   | Stored and managed by ArcGIS         |
| `WaterLevel`  | Double | Available for future use             |
| `FloodStage`  | Double | Available for future use             |
| `AlertLevel`  | String | Available for future use             |
| `LocationName`| String | Available for future use             |



##  How It Works

```
Browser loads index.html
       │
       ├── Loads style.css   (all styling)
       └── Loads app.js      (all logic)
                │
                ▼
       fetchActiveCount() runs on page load
                │
                ├── Calls ArcGIS REST API
                │     WHERE Status = 'Active'
                │     returnCountOnly = true
                │
                ├── Updates "X Active" pill in header
                └── Updates "Updated HH:MM" in footer ribbon
                         │
                         ▼
              Repeats automatically every 15 minutes
```

---

##  Key Code — The API Query

In `app.js`, the core query that fetches the live count:

```js
const params = new URLSearchParams({
  where:           `Status='Active'`,
  returnCountOnly: "true",
  f:               "json"
});

const res  = await fetch(`${FEATURE_LAYER_URL}?${params}`);
const data = await res.json();
// ArcGIS returns: { "count": 3 }
```

---

##  Deployment — GitHub → Azure

This project is deployed via **GitHub → Azure App Service** with automatic deployment on every push.

### Steps to deploy

1. Add all 4 files to your GitHub repository in the same folder
2. Go to **Azure Portal** → your Web App → **Deployment Center**
3. Set **Source** to **GitHub**
4. Select your repository and branch (`main`)
5. Click **Save**

Azure automatically redeploys within ~30 seconds every time you push a change to GitHub.

### Azure settings

| Setting       | Value            |
|---------------|------------------|
| Runtime stack | Node 22 LTS      |
| OS            | Linux            |
| Region        | South Central US |



---

##  Configuration

To update the ArcGIS layer URL, change this line at the top of `app.js`:

```js
const FEATURE_LAYER_URL =
  "https://services.arcgis.com/YOUR_ORG_ID/arcgis/rest/services/YOUR_LAYER_NAME/FeatureServer/0/query";
```

To change the refresh interval (default 15 minutes):

```js
const REFRESH_MS = 15 * 60 * 1000; // change 15 to any number of minutes
```

---

##  Test the API in Your Browser

Paste this URL directly into your browser to verify the layer is returning data:

```
https://services.arcgis.com/ts4gk3YgS68yLGFl/arcgis/rest/services/Florida_Flood_Warning_Areas_view/FeatureServer/0/query?where=Status='Active'&returnCountOnly=true&f=json
```

Expected response:
```json
{ "count": 3 }
```

---



##  Developer

**Madusha Maha Gamage**
University of Alabama
`mmahagamage@ua.edu`

---

##  Data Sources

>  **Note:** The data currently shown in this dashboard is **not real-world data**. It consists of randomly generated sample points created for demonstration purposes only.

---

##  License

This project was created for academic and demonstration purposes at the University of Alabama.
