# ข้อกำหนดขอบเขตงาน (Terms of Reference)

## ระบบบริหารจัดการพลังงานและโลจิสติกส์อัจฉริยะครบวงจร

**ชื่อระบบ**: SIAM EV — Unified Energy & Logistics Management Platform  
**เวอร์ชัน TOR**: 1.0  
**วันที่จัดทำ**: เมษายน 2569

---

## 1. บทนำและวัตถุประสงค์

### 1.1 ภาพรวม

ระบบ SIAM EV Platform เป็นแพลตฟอร์มบริหารจัดการครบวงจร (Unified Operations Platform) ที่ผนวก 3 โดเมนหลักเข้าด้วยกัน:

| โดเมน | ขอบเขต |
|--------|---------|
| **EV Charging Management** | บริหารสถานีชาร์จ EV, รอบการชาร์จ, Smart Charging, V2G |
| **Fleet Optimization** | จัดเส้นทาง, ติดตามยานพาหนะ, วางแผนการชาร์จฟลีท EV |
| **Facilities Energy Analytics** | วิเคราะห์การใช้พลังงานอาคาร, Demand Response, พลังงานหมุนเวียน |

### 1.2 วัตถุประสงค์

1. รวมศูนย์การบริหารจัดการสถานีชาร์จ, กองยานพาหนะ, และพลังงานอาคาร บนแพลตฟอร์มเดียว
2. ลดต้นทุนพลังงานรวมขององค์กรผ่าน Cross-Domain Optimization
3. เพิ่มประสิทธิภาพการใช้ทรัพยากรด้วย AI/ML Predictive Analytics
4. รองรับมาตรฐานสากล OCPP 2.0.1, OCPI 2.2, ISO 15118

### 1.3 ขอบเขตการให้บริการ

- พื้นที่นำร่อง: กรุงเทพมหานครและปริมณฑล
- สถานีชาร์จ: รองรับตั้งแต่ 10–500 สถานี
- กองยาน: รองรับตั้งแต่ 6–200 คัน (รวมทั้ง EV และ ICE)
- อาคาร/สิ่งอำนวยความสะดวก: รองรับตั้งแต่ 5–50 แห่ง

---

## 2. สถาปัตยกรรมระบบ (System Architecture)

### 2.1 ภาพรวมสถาปัตยกรรม

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                                │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  ┌──────────────┐  │
│  │ Web Dashboard│  │  Mobile App  │  │ Kiosk Mode  │  │ Public API   │  │
│  │  (Next.js)   │  │ (React Native│  │ (Fullscreen)│  │  (REST/WS)   │  │
│  └─────────────┘  └──────────────┘  └─────────────┘  └──────────────┘  │
└──────────────────────────────┬───────────────────────────────────────────┘
                               │
┌──────────────────────────────┴───────────────────────────────────────────┐
│                        APPLICATION LAYER                                 │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    API Gateway (Kong / Traefik)                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │  EV Charging │  │    Fleet     │  │  Facilities  │  │ Cross-Domain│  │
│  │   Service    │  │   Service    │  │   Service    │  │ Optimizer   │  │
│  └─────────────┘  └──────────────┘  └──────────────┘  └────────────┘  │
│                                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │ Auth & RBAC │  │ Notification │  │  Reporting   │  │  AI/ML     │  │
│  │   Service   │  │   Service    │  │   Service    │  │  Engine    │  │
│  └─────────────┘  └──────────────┘  └──────────────┘  └────────────┘  │
└──────────────────────────────┬───────────────────────────────────────────┘
                               │
┌──────────────────────────────┴───────────────────────────────────────────┐
│                        DATA & INTEGRATION LAYER                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │PostgreSQL│  │TimescaleDB│  │  Redis   │  │  MQTT    │  │ Node-RED │ │
│  │ (Master) │  │(Time-Series)│ │ (Cache) │  │ (Broker) │  │  (OCPP)  │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

### 2.2 เทคโนโลยีหลัก

| ชั้น | เทคโนโลยี |
|------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4, Leaflet/MapLibre |
| Backend | Node.js (NestJS), Python (FastAPI สำหรับ ML pipeline) |
| Real-time | WebSocket, MQTT (Mosquitto), Server-Sent Events |
| Database | PostgreSQL 16 + TimescaleDB (time-series), Redis (cache & pub/sub) |
| OCPP Gateway | Node-RED + node-red-contrib-ocpp |
| ML/AI | Python, scikit-learn, Prophet, TensorFlow Lite |
| Deployment | Docker Compose, Kubernetes (production), CapRover (staging) |
| CI/CD | GitHub Actions |

---

## 3. โมดูล 1 — EV Charging Management (CSMS)

### 3.1 ฟังก์ชันที่มีในระบบปัจจุบัน (Baseline)

| รหัส | ฟังก์ชัน | รายละเอียด |
|------|----------|-----------|
| EV-B01 | แผนที่สถานีชาร์จ Real-time | แสดงตำแหน่งสถานีบน Leaflet Map พร้อมสถานะ (Available/Charging/Faulted) |
| EV-B02 | Monitoring Dashboard | แสดง Net Energy (kWh), Max Capacity (kW), Live Output (kW) แบบ Real-time |
| EV-B03 | Station Detail Panel | แสดงรายละเอียดสถานีแต่ละจุด: กำลังไฟ, สถานะซ็อกเก็ต, มิเตอร์สะสม |
| EV-B04 | Schedule Management | ตั้งเวลาเปิด-ปิดสถานีชาร์จ (startTime/endTime/enabled) |
| EV-B05 | OCPP Proxy | Reverse proxy เชื่อมต่อ Node-RED OCPP backend |
| EV-B06 | Nodes Table View | ตารางสถานีชาร์จทั้งหมด พร้อมการค้นหาและเรียงลำดับ |

### 3.2 ฟังก์ชันใหม่ (Enhanced)

#### 3.2.1 OCPP 2.0.1 Full Compliance

| รหัส | ฟังก์ชัน | รายละเอียด | Priority |
|------|----------|-----------|----------|
| EV-E01 | OCPP 2.0.1 Core Profile | รองรับ Boot Notification, Heartbeat, Status Notification, Authorize, Start/Stop Transaction, Meter Values ตามมาตรฐาน OCPP 2.0.1 | P0 |
| EV-E02 | Remote Start/Stop | สั่ง Start/Stop Transaction จาก Dashboard ผ่าน OCPP RemoteStartTransaction / RemoteStopTransaction | P0 |
| EV-E03 | Firmware Management | OTA firmware update สำหรับสถานีชาร์จ: upload, schedule, rollback | P1 |
| EV-E04 | Diagnostics Collection | ดึง diagnostics logs จากสถานีชาร์จผ่าน OCPP GetDiagnostics | P1 |
| EV-E05 | Configuration Management | อ่าน/เขียน Configuration Key ของสถานีชาร์จ (GetConfiguration, ChangeConfiguration) | P1 |
| EV-E06 | Reservation Support | จองสถานีชาร์จล่วงหน้า (ReserveNow, CancelReservation) | P2 |

#### 3.2.2 Smart Charging

| รหัส | ฟังก์ชัน | รายละเอียด | Priority |
|------|----------|-----------|----------|
| EV-S01 | Dynamic Load Balancing | กระจายโหลดไฟฟ้าอัตโนมัติระหว่างสถานีชาร์จภายในกลุ่ม เมื่อกำลังไฟรวมเกินเกณฑ์ที่กำหนด (Site Power Limit) | P0 |
| EV-S02 | Charging Profile Management | สร้างและจัดการ Charging Profile (TxDefaultProfile, TxProfile, ChargePointMaxProfile) ตาม OCPP Smart Charging | P0 |
| EV-S03 | Time-of-Use Optimization | จัดตารางชาร์จตามอัตราค่าไฟ TOU (On-Peak/Off-Peak/Holiday) เพื่อลดค่าใช้จ่าย | P1 |
| EV-S04 | Priority Queue | จัดลำดับความสำคัญการชาร์จ: รถฟลีทที่ต้องออกเร็ว > รถทั่วไป > รถที่ชาร์จเต็มแล้ว | P1 |
| EV-S05 | Vehicle-to-Grid (V2G) Readiness | รองรับ bidirectional charging: แสดงสถานะ V2G capability, กำหนด discharge schedule, คำนวณรายได้จากการขายไฟคืนกริด | P2 |

#### 3.2.3 Session & Billing

| รหัส | ฟังก์ชัน | รายละเอียด | Priority |
|------|----------|-----------|----------|
| EV-SB01 | Charging Session Lifecycle | บันทึกครบวงจร: เริ่มชาร์จ → Meter Values (ทุก 15 วินาที) → หยุดชาร์จ → สรุปค่าใช้จ่าย | P0 |
| EV-SB02 | Transaction History | ประวัติธุรกรรมย้อนหลัง 12 เดือน พร้อมกรอง: สถานี, ช่วงเวลา, สถานะ, ผู้ใช้, ยานพาหนะ | P0 |
| EV-SB03 | Dynamic Pricing Engine | คำนวณค่าชาร์จแบบยืดหยุ่น: ราคาตาม kWh, ตามเวลา (TOU), demand surcharge, สมาชิก discount | P1 |
| EV-SB04 | CDR Generation (OCPI) | สร้าง Charge Detail Record ตามมาตรฐาน OCPI 2.2 สำหรับ roaming settlement | P2 |
| EV-SB05 | Payment Integration | เชื่อมต่อ payment gateway (QR PromptPay, บัตรเครดิต, RFID card, mobile wallet) | P1 |

#### 3.2.4 Predictive Maintenance

| รหัส | ฟังก์ชัน | รายละเอียด | Priority |
|------|----------|-----------|----------|
| EV-PM01 | Health Score | คำนวณคะแนนสุขภาพสถานีชาร์จ (0–100) จาก: uptime, error frequency, power variance, temperature | P1 |
| EV-PM02 | Anomaly Detection | ตรวจจับความผิดปกติ: แรงดันไฟฟ้าผิดปกติ, current leakage, temperature spike (ใช้ Isolation Forest / Z-score) | P1 |
| EV-PM03 | Failure Prediction | คาดการณ์ว่าสถานีใดจะเสีย ภายในกี่วัน (MTBF prediction ด้วย survival analysis) | P2 |
| EV-PM04 | Maintenance Scheduler | สร้างตาราง preventive maintenance อัตโนมัติ ตาม Health Score + utilization + failure prediction | P2 |

---

## 4. โมดูล 2 — Fleet Optimization

### 4.1 ฟังก์ชันที่มีในระบบปัจจุบัน (Baseline)

| รหัส | ฟังก์ชัน | รายละเอียด |
|------|----------|-----------|
| FL-B01 | แผนที่ติดตามยานพาหนะ Real-time | แสดงตำแหน่ง, ทิศทาง, ความเร็วของรถแต่ละคันบนแผนที่ |
| FL-B02 | สถานะยานพาหนะ | แสดงสถานะ: En Route / Idle / Loading / Returning / Maintenance |
| FL-B03 | ข้อมูลเส้นทาง | แสดง origin, destination, waypoints, ETA, ระยะทางเหลือ |
| FL-B04 | ข้อมูลสินค้า | จำนวนพัสดุ: loaded, capacity, available slots, load level (0–5) |
| FL-B05 | Fleet Table View | ตารางยานพาหนะทั้งหมด พร้อมข้อมูลคนขับ |

### 4.2 ฟังก์ชันใหม่ (Enhanced)

#### 4.2.1 Route Optimization

| รหัส | ฟังก์ชัน | รายละเอียด | Priority |
|------|----------|-----------|----------|
| FL-R01 | Multi-Stop Route Optimization | คำนวณเส้นทางที่ประหยัดที่สุดสำหรับการส่งหลายจุด (Traveling Salesman variant ด้วย OR-Tools / Google Directions API) | P0 |
| FL-R02 | Real-time Re-routing | ปรับเส้นทางอัตโนมัติเมื่อเจอสภาพจราจร, อุบัติเหตุ, หรือ order cancellation (ใช้ traffic API) | P1 |
| FL-R03 | Geofencing & Alerts | กำหนดเขตพื้นที่ (polygon): แจ้งเตือนเมื่อรถเข้า/ออกเขต, คำนวณ dwell time ที่จุดจอด | P1 |
| FL-R04 | Historical Route Analytics | วิเคราะห์ประสิทธิภาพเส้นทาง: เวลาจริง vs ETA, เส้นทางที่ใช้บ่อย, คอขวดจราจร | P2 |

#### 4.2.2 EV Fleet Charging Orchestration

| รหัส | ฟังก์ชัน | รายละเอียด | Priority |
|------|----------|-----------|----------|
| FL-EC01 | Battery State Tracking | ติดตาม State of Charge (SoC), State of Health (SoH), estimated range สำหรับรถ EV ในฟลีท | P0 |
| FL-EC02 | Charge Planning | วางแผนว่ารถคันไหนต้องชาร์จที่สถานีใด เมื่อไร ตามเงื่อนไข: SoC ขั้นต่ำก่อนออกงาน, ตาราง TOU, ความพร้อมของสถานี | P0 |
| FL-EC03 | Range Anxiety Prevention | แจ้งเตือนล่วงหน้าเมื่อ SoC ของรถจะไม่พอถึงจุดหมาย พร้อมแนะนำสถานีชาร์จระหว่างทาง | P1 |
| FL-EC04 | Depot Charging Scheduler | จัดตารางชาร์จรถที่ depot ในช่วงกลางคืน: minimize ค่าไฟ (TOU) + ทุกคันพร้อมก่อนเวลาออกงาน | P1 |
| FL-EC05 | Battery Degradation Tracking | ติดตาม SoH trend ของแบตเตอรี่แต่ละคัน, คาดการณ์อายุแบตเตอรี่เหลือ, แนะนำช่วงเวลาเปลี่ยน | P2 |

#### 4.2.3 Dispatch & Load Optimization

| รหัส | ฟังก์ชัน | รายละเอียด | Priority |
|------|----------|-----------|----------|
| FL-D01 | Smart Dispatch | กระจายงานอัตโนมัติตาม: ตำแหน่งใกล้สุด, load capacity เหลือ, SoC (ถ้า EV), ชั่วโมงทำงานคนขับ | P0 |
| FL-D02 | Load Consolidation | รวม shipments ที่ไปทิศทางเดียวกันเข้ารถคันเดียว เพื่อลดจำนวนเที่ยว | P1 |
| FL-D03 | Driver Performance Scoring | คะแนนคนขับ: eco-driving score (การเร่ง/เบรก/ความเร็ว), on-time delivery rate, fuel/energy efficiency | P1 |
| FL-D04 | Driver HOS Compliance | ติดตามชั่วโมงทำงานคนขับ (Hours of Service) ป้องกันการทำงานเกินเวลาตามกฎหมาย | P2 |
| FL-D05 | Proof of Delivery | บันทึกหลักฐานส่งสินค้า: ภาพถ่าย, ลายเซ็นดิจิทัล, timestamp, GPS coordinates | P2 |

#### 4.2.4 Fleet Analytics

| รหัส | ฟังก์ชัน | รายละเอียด | Priority |
|------|----------|-----------|----------|
| FL-A01 | Fleet Utilization Dashboard | อัตราการใช้งานยานพาหนะ: idle time, active time, utilization %, km/วัน | P0 |
| FL-A02 | TCO Analysis | คำนวณ Total Cost of Ownership: ค่าพลังงาน/เชื้อเพลิง, ค่าบำรุงรักษา, ค่าเสื่อม, ค่าประกัน ต่อคัน ต่อ km | P1 |
| FL-A03 | EV vs ICE Comparison | เปรียบเทียบต้นทุนการเป็นเจ้าของ EV vs ICE fleet เพื่อวางแผน fleet transition | P2 |
| FL-A04 | Carbon Footprint Tracker | คำนวณ CO2 emissions ที่ลดได้จากการใช้ EV fleet เทียบกับ ICE baseline | P1 |

---

## 5. โมดูล 3 — Facilities Energy Analytics

### 5.1 ฟังก์ชันที่มีในระบบปัจจุบัน (Baseline)

| รหัส | ฟังก์ชัน | รายละเอียด |
|------|----------|-----------|
| FA-B01 | แผนที่สิ่งอำนวยความสะดวก | แสดงตำแหน่ง Warehouse, Office, Factory, Distribution Center บนแผนที่ |
| FA-B02 | Real-time Power Monitoring | แสดงกำลังไฟ (kW), พลังงานรายวัน/รายเดือน (kWh), Peak Demand, PUE |
| FA-B03 | Zone-level Breakdown | แสดงการใช้พลังงานแยกตามโซน: ชั้น, สำนักงาน, คลังสินค้า, ห้องเย็น |
| FA-B04 | สถานะอาคาร | แสดงสถานะ: Normal / High Usage / Critical / Offline |
| FA-B05 | Occupancy Tracking | แสดง % การใช้พื้นที่ของแต่ละโซน |

### 5.2 ฟังก์ชันใหม่ (Enhanced)

#### 5.2.1 Advanced Energy Monitoring

| รหัส | ฟังก์ชัน | รายละเอียด | Priority |
|------|----------|-----------|----------|
| FA-M01 | Sub-metering Integration | เชื่อมต่อ smart meter (Modbus/BACnet/MQTT) เพื่อวัดการใช้ไฟแยกตาม: HVAC, Lighting, Equipment, Plug Load | P0 |
| FA-M02 | Power Quality Monitoring | ติดตาม: voltage, current, power factor, harmonic distortion, frequency deviation | P1 |
| FA-M03 | Energy Intensity Metrics | คำนวณ kWh/m², kWh/unit produced, kWh/employee สำหรับ benchmarking | P1 |
| FA-M04 | Cost Allocation | แบ่งค่าไฟตามผู้เช่า/แผนก/โซน อัตโนมัติ ตามข้อมูล sub-meter จริง | P2 |

#### 5.2.2 Demand Response & Peak Management

| รหัส | ฟังก์ชัน | รายละเอียด | Priority |
|------|----------|-----------|----------|
| FA-DR01 | Peak Demand Forecasting | คาดการณ์ peak demand ล่วงหน้า 24–72 ชั่วโมง (ด้วย Prophet / LSTM) จาก: historical usage, weather forecast, production schedule | P0 |
| FA-DR02 | Automated Peak Shaving | ลด peak demand อัตโนมัติ: ลด HVAC setpoint, ปิดไฟที่ไม่จำเป็น, เลื่อนการชาร์จ EV ไปช่วง off-peak | P1 |
| FA-DR03 | Demand Charge Optimization | ลดค่า demand charge รายเดือน โดยกระจาย load ให้ peak ไม่เกินเกณฑ์ที่ตั้งไว้ | P1 |
| FA-DR04 | Utility Rate Comparison | เปรียบเทียบแผนค่าไฟ (TOU, ToD, Flat rate) แนะนำแผนที่ประหยัดที่สุดตาม load profile จริง | P2 |

#### 5.2.3 Renewable Energy Integration

| รหัส | ฟังก์ชัน | รายละเอียด | Priority |
|------|----------|-----------|----------|
| FA-RE01 | Solar PV Monitoring | ติดตามผลผลิตจาก Solar PV: real-time generation (kW), daily/monthly yield (kWh), performance ratio | P1 |
| FA-RE02 | Self-consumption Optimization | เพิ่มสัดส่วนการใช้ไฟจาก Solar: เลื่อน load ที่ยืดหยุ่นได้ (EV charging, cooling) ไปช่วงแดดดี | P1 |
| FA-RE03 | Battery Energy Storage (BESS) | จัดการ BESS: charge จาก solar/off-peak, discharge ตอน peak, automated scheduling ตาม forecast | P2 |
| FA-RE04 | Net Metering Dashboard | แสดง: import/export energy, net billing, REC (Renewable Energy Certificate) accumulation | P2 |

#### 5.2.4 Building Intelligence

| รหัส | ฟังก์ชัน | รายละเอียด | Priority |
|------|----------|-----------|----------|
| FA-BI01 | HVAC Optimization | แนะนำ setpoint ที่เหมาะสม ตาม: occupancy, weather, energy price (model-predictive control concept) | P1 |
| FA-BI02 | Lighting Schedule Automation | สร้างตาราง on/off อัตโนมัติจาก occupancy sensor + daylight sensor data | P2 |
| FA-BI03 | Indoor Air Quality (IAQ) | ติดตาม CO2, PM2.5, Temperature, Humidity ควบคู่กับ energy consumption เพื่อหาจุดสมดุล comfort vs efficiency | P2 |
| FA-BI04 | Digital Twin (Visual) | แสดง 3D floor plan ของอาคาร พร้อม heatmap การใช้พลังงานแบบ real-time | P3 |

#### 5.2.5 Compliance & Sustainability

| รหัส | ฟังก์ชัน | รายละเอียด | Priority |
|------|----------|-----------|----------|
| FA-CS01 | Carbon Accounting | คำนวณ Scope 1 & 2 GHG emissions จากข้อมูลพลังงานจริง ตาม GHG Protocol | P1 |
| FA-CS02 | ESG Report Generator | สร้างรายงาน ESG อัตโนมัติ: energy consumption, carbon intensity, renewable %, waste reduction | P2 |
| FA-CS03 | LEED / TREES Credit Tracker | ติดตามคะแนน green building ตามเกณฑ์ LEED หรือ TREES (Thailand) | P3 |

---

## 6. โมดูล 4 — Cross-Domain Intelligence

ฟังก์ชันที่เชื่อมโยง 3 โดเมนเข้าด้วยกัน ซึ่งเป็น **จุดแข่งขันหลัก** ของระบบ

| รหัส | ฟังก์ชัน | รายละเอียด | Priority |
|------|----------|-----------|----------|
| CD-01 | Unified Energy Dashboard | แสดงภาพรวมพลังงานทั้งองค์กรในหน้าเดียว: Building consumption + EV charging load + Fleet energy + Solar generation | P0 |
| CD-02 | Site Power Budget Controller | กำหนด power budget ระดับ site: ถ้า building load สูง → ลด EV charging rate อัตโนมัติ; ถ้า solar surplus → เพิ่ม EV charging rate | P0 |
| CD-03 | Fleet-Charger Matching | เมื่อรถ EV ฟลีทเข้า depot → ระบบจับคู่สถานีชาร์จที่เหมาะสมอัตโนมัติ ตาม SoC, departure time, station availability, power rate | P1 |
| CD-04 | Energy Arbitrage Engine | ซื้อไฟตอนถูก เก็บใน BESS/EV battery → ใช้ตอนแพง; coordinate กับ V2G, solar forecast, building demand forecast | P2 |
| CD-05 | Scenario Simulator | what-if analysis: เพิ่มสถานีชาร์จ X จุด / เปลี่ยนฟลีทเป็น EV ทั้งหมด / ติด solar Y kW → ผลกระทบต่อค่าไฟ, carbon, ROI | P2 |
| CD-06 | Anomaly Correlation | ตรวจพบว่า facility power spike + EV charger fault + fleet delay เกิดจากเหตุเดียวกัน (เช่น ไฟดับพื้นที่) แจ้งรวม | P2 |

---

## 7. โมดูล 5 — แพลตฟอร์มพื้นฐาน (Platform Foundation)

### 7.1 Authentication & Authorization

| รหัส | ฟังก์ชัน | รายละเอียด | Priority |
|------|----------|-----------|----------|
| PF-A01 | Multi-tenant Architecture | รองรับหลายองค์กรบนระบบเดียวกัน แยก data isolation | P0 |
| PF-A02 | Role-Based Access Control | บทบาท: Super Admin, Org Admin, Site Manager, Fleet Manager, Operator, Viewer | P0 |
| PF-A03 | SSO Integration | เชื่อมต่อ Google Workspace, Microsoft Entra ID, LDAP | P1 |
| PF-A04 | API Key Management | ออก API key สำหรับ 3rd party integration พร้อม rate limiting | P1 |

### 7.2 Notification & Alerting

| รหัส | ฟังก์ชัน | รายละเอียด | Priority |
|------|----------|-----------|----------|
| PF-N01 | Alert Rules Engine | สร้างเงื่อนไขแจ้งเตือนแบบ flexible: metric > threshold for duration → action | P0 |
| PF-N02 | Multi-channel Notification | แจ้งเตือนผ่าน: LINE OA, Email, SMS, In-app notification, Webhook | P0 |
| PF-N03 | Escalation Policy | ถ้าไม่มีคน acknowledge ภายใน X นาที → escalate ไปหัวหน้า | P1 |
| PF-N04 | Alert History & Analytics | ประวัติ alert ทั้งหมด, วิเคราะห์ alert ที่เกิดบ่อย, ลด false positive | P2 |

### 7.3 Reporting

| รหัส | ฟังก์ชัน | รายละเอียด | Priority |
|------|----------|-----------|----------|
| PF-R01 | Scheduled Reports | สร้างรายงานอัตโนมัติ รายวัน/รายสัปดาห์/รายเดือน ส่งทาง email/LINE | P0 |
| PF-R02 | Custom Report Builder | drag-and-drop สร้าง report จาก metric ใดก็ได้ พร้อม chart type ที่เลือกได้ | P1 |
| PF-R03 | Export | ส่งออก PDF, Excel, CSV สำหรับทุก report | P0 |
| PF-R04 | Audit Log | บันทึกทุก action ของ user: who did what, when, from where | P1 |

### 7.4 Integration & API

| รหัส | ฟังก์ชัน | รายละเอียด | Priority |
|------|----------|-----------|----------|
| PF-I01 | REST API (OpenAPI 3.1) | Documented API สำหรับทุก resource: stations, vehicles, facilities, sessions, reports | P0 |
| PF-I02 | WebSocket Real-time API | Publish real-time updates: station status changes, vehicle position, energy readings | P0 |
| PF-I03 | OCPI 2.2 Roaming Hub | เชื่อมต่อกับ roaming network อื่น: แชร์สถานีชาร์จข้ามเครือข่าย | P2 |
| PF-I04 | ERP Integration | เชื่อมกับ SAP / Oracle สำหรับ billing reconciliation, asset management | P3 |
| PF-I05 | BMS/SCADA Gateway | เชื่อมกับ Building Management System ผ่าน BACnet/Modbus TCP | P2 |

---

## 8. Mobile Application

| รหัส | ฟังก์ชัน | รายละเอียด | Priority |
|------|----------|-----------|----------|
| MB-01 | Operator Mobile App | React Native app สำหรับ: ดูสถานะ, รับ alert, Remote Start/Stop, ดู fleet location | P1 |
| MB-02 | Driver App | สำหรับคนขับ: นำทาง, scan QR ชาร์จรถ, proof of delivery, ดู schedule | P1 |
| MB-03 | EV User App (B2C) | สำหรับผู้ใช้ทั่วไป: ค้นหาสถานีชาร์จ, จอง, ชำระเงิน, ดูประวัติ | P2 |
| MB-04 | Push Notifications | แจ้งเตือน: ชาร์จเสร็จ, สถานีว่าง, alert, delivery assignment | P1 |
| MB-05 | Offline Mode | ใช้งานได้บางส่วนเมื่อไม่มีอินเทอร์เน็ต: ดูข้อมูล cached, proof of delivery queue | P2 |

---

## 9. AI/ML Capabilities

| รหัส | ฟังก์ชัน | ML Model | Input Data | Priority |
|------|----------|----------|-----------|----------|
| AI-01 | Energy Demand Forecast | Prophet / LSTM | Historical consumption, weather, calendar, occupancy | P0 |
| AI-02 | EV Charging Demand Forecast | Gradient Boosting | Session history, time-of-day, events, weather | P1 |
| AI-03 | Charger Failure Prediction | Survival Analysis / Random Forest | Error logs, uptime, meter data, temperature | P1 |
| AI-04 | Route Time Prediction | XGBoost | Historical trip times, traffic patterns, time-of-day, weather | P1 |
| AI-05 | Optimal Fleet Size Recommendation | Simulation (Monte Carlo) | Delivery demand, route data, vehicle specs, charging constraints | P2 |
| AI-06 | Anomaly Detection (Multi-domain) | Isolation Forest / Autoencoder | All sensor data across EV, Fleet, Facilities | P1 |

---

## 10. Non-Functional Requirements

### 10.1 Performance

| ข้อกำหนด | เกณฑ์ |
|-----------|-------|
| Dashboard Load Time | < 2 วินาที (First Contentful Paint) |
| Real-time Data Latency | < 3 วินาที (จาก sensor → dashboard) |
| API Response Time (p95) | < 200ms สำหรับ read, < 500ms สำหรับ write |
| Map Rendering | แสดง 500 markers โดยไม่กระตุก (60 FPS) |
| Concurrent Users | รองรับ 500 users พร้อมกัน |

### 10.2 Availability & Reliability

| ข้อกำหนด | เกณฑ์ |
|-----------|-------|
| Uptime SLA | 99.5% (ยกเว้น planned maintenance) |
| Data Retention | Raw data 12 เดือน, Aggregated data 5 ปี |
| Backup | Automated daily backup, RPO < 1 ชั่วโมง, RTO < 4 ชั่วโมง |
| Disaster Recovery | Secondary region failover (optional) |

### 10.3 Security

| ข้อกำหนด | เกณฑ์ |
|-----------|-------|
| Authentication | JWT + Refresh Token, MFA support |
| Data Encryption | TLS 1.3 in-transit, AES-256 at-rest |
| OWASP Compliance | ผ่าน OWASP Top 10 assessment |
| Penetration Testing | ผ่านการทดสอบจากทีมภายนอกก่อน go-live |
| PDPA Compliance | จัดเก็บและประมวลผลข้อมูลส่วนบุคคลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล |

### 10.4 Scalability

| ข้อกำหนด | เกณฑ์ |
|-----------|-------|
| Horizontal Scaling | เพิ่ม instance ได้โดยไม่ต้อง downtime (Kubernetes HPA) |
| Database Scaling | TimescaleDB hypertable partitioning สำหรับ time-series data |
| Message Queue | MQTT broker cluster สำหรับ > 10,000 concurrent device connections |

---

## 11. แผนการพัฒนา (Implementation Roadmap)

### Phase 1 — Foundation (เดือนที่ 1–3)

- ระบบ Authentication, RBAC, Multi-tenant
- EV Charging: OCPP 2.0.1 core, Remote Start/Stop, Session Lifecycle
- Fleet: Real-time tracking, Fleet Utilization Dashboard
- Facilities: Sub-metering integration, Real-time monitoring
- Unified Dashboard (CD-01)
- Alert engine + LINE/Email notification

### Phase 2 — Intelligence (เดือนที่ 4–6)

- Smart Charging: Load Balancing, TOU Optimization, Charging Profiles
- Fleet: Route Optimization, Smart Dispatch, Charge Planning (EV fleet)
- Facilities: Peak Demand Forecasting, Demand Charge Optimization
- Cross-Domain: Site Power Budget Controller (CD-02), Fleet-Charger Matching (CD-03)
- AI: Energy Demand Forecast, Anomaly Detection
- Mobile App v1 (Operator + Driver)

### Phase 3 — Advanced (เดือนที่ 7–9)

- Dynamic Pricing, Payment Integration, CDR (OCPI)
- V2G Readiness, Battery Energy Storage management
- Solar PV monitoring, Self-consumption optimization
- Predictive Maintenance, Health Score
- Carbon Accounting, ESG Report
- Scenario Simulator (CD-05)

### Phase 4 — Scale & Polish (เดือนที่ 10–12)

- OCPI 2.2 Roaming Hub
- ERP/BMS Integration
- Digital Twin (Visual)
- EV User App (B2C)
- Load testing, Penetration testing, PDPA audit
- Documentation, training, go-live

---

## 12. เกณฑ์การตัดสิน (สำหรับการแข่งขัน)

ตาราง mapping ระหว่างความสามารถของระบบกับเกณฑ์การแข่งขันทั่วไป:

| เกณฑ์ | ฟังก์ชันที่ตอบโจทย์ | น้ำหนัก |
|-------|---------------------|---------|
| **Innovation** | Cross-Domain Intelligence (CD-01–06), V2G, Energy Arbitrage, Scenario Simulator | 25% |
| **Technical Completeness** | OCPP 2.0.1 full profile, OCPI 2.2, ISO 15118 readiness, ML pipeline | 25% |
| **Practical Impact** | ลดค่าไฟ (TOU + Peak Shaving + Solar), ลดต้นทุน fleet (Route Optimization + EV transition), ลด carbon | 20% |
| **User Experience** | Unified Dashboard, Mobile App, Real-time Map, Kiosk Mode | 15% |
| **Scalability & Architecture** | Multi-tenant, Kubernetes, TimescaleDB, MQTT cluster | 15% |

---

## 13. ตารางสรุปฟังก์ชันทั้งหมด

| โดเมน | Baseline (มีแล้ว) | Enhanced (ใหม่) | รวม |
|--------|-------------------|-----------------|-----|
| EV Charging | 6 | 19 | 25 |
| Fleet | 5 | 18 | 23 |
| Facilities | 5 | 18 | 23 |
| Cross-Domain | 0 | 6 | 6 |
| Platform Foundation | 0 | 15 | 15 |
| Mobile | 0 | 5 | 5 |
| AI/ML | 0 | 6 | 6 |
| **รวม** | **16** | **87** | **103** |

---

## 14. คำจำกัดความและคำย่อ

| คำย่อ | ความหมาย |
|-------|----------|
| OCPP | Open Charge Point Protocol — มาตรฐานสื่อสารระหว่าง CSMS กับสถานีชาร์จ |
| OCPI | Open Charge Point Interface — มาตรฐาน roaming ระหว่างเครือข่ายชาร์จ |
| ISO 15118 | มาตรฐาน Plug & Charge (ยืนยันตัวตนผ่านสาย EV โดยไม่ต้องใช้บัตร/แอป) |
| CSMS | Charging Station Management System |
| SoC | State of Charge — ระดับแบตเตอรี่ (%) |
| SoH | State of Health — สุขภาพแบตเตอรี่ (%) |
| TOU | Time of Use — อัตราค่าไฟตามช่วงเวลา |
| V2G | Vehicle-to-Grid — เทคโนโลยีจ่ายไฟจาก EV คืนกริด |
| BESS | Battery Energy Storage System |
| PUE | Power Usage Effectiveness — ดัชนีประสิทธิภาพพลังงานอาคาร |
| MTBF | Mean Time Between Failures |
| CDR | Charge Detail Record — บันทึกธุรกรรมการชาร์จ |
| GHG | Greenhouse Gas |
| PDPA | พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 |
| HOS | Hours of Service — กฎเกณฑ์ชั่วโมงทำงานคนขับ |
| TCO | Total Cost of Ownership |
| HPA | Horizontal Pod Autoscaler (Kubernetes) |
| RPO/RTO | Recovery Point Objective / Recovery Time Objective |

---

*เอกสารฉบับนี้จัดทำเพื่อใช้เป็นสเปคระบบสำหรับการแข่งขัน โดยอ้างอิงจากระบบ SIAM EV CSMS ที่พัฒนาแล้วบางส่วน และเพิ่มเติมฟังก์ชันที่สามารถพัฒนาได้จริงด้วยเทคโนโลยีที่มีอยู่ในปัจจุบัน*
