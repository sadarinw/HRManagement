# ผลตรวจสอบ Revision 4

## สรุป
- ผ่าน 64/64 ข้อจากชุดทดสอบ UI จำลอง
- ไม่พบ JavaScript page error ในการทดสอบ
- `node --check app.js` ผ่าน

## สภาพแวดล้อมและขอบเขต
ทดสอบ JavaScript/CSS จริงด้วย Chromium ผ่าน Playwright ที่ความกว้าง 1440 และ 390 พิกเซล ในสภาพแวดล้อมออฟไลน์ ใช้ภาพจากโปรเจกต์และ Web Storage จำลองในหน่วยความจำ เนื่องจากเบราว์เซอร์ทดสอบไม่อนุญาตการนำทาง URL จึงไม่ได้เป็นการเปิดเว็บผ่าน Live Server ในเบราว์เซอร์ผู้ใช้จริง

ยังไม่ทดสอบ Safari/macOS/iPhone จริง และยังไม่ทดสอบผลการเปิดรายงานใน Microsoft Word/Excel ไม่ได้อ้างว่าเป็น QA ครบทุกกรณี การคง storage key ตรวจจากซอร์สและ fixture ไม่ใช่การเข้าถึงข้อมูลในเครื่องของผู้ใช้

## รายการทดสอบ
1. PASS — Initial mock records available
2. PASS — Login has 3 black bold group headings
3. PASS — Login lists exactly 5 accounts
4. PASS — Account picker fits viewport
5. PASS — Picker closes with Escape
6. PASS — Keyboard selects grouped account
7. PASS — Selected account enters correct session
8. PASS — Sidebar uses SVG icons
9. PASS — Desktop hamburger collapses and reclaims space
10. PASS — Desktop hamburger expands
11. PASS — Work filter controls have equal sizes
12. PASS — Scope selector and clear share header
13. PASS — Work has no personnel scope option
14. PASS — All dates use short black uniform range
15. PASS — Workflow step and date font match black
16. PASS — Status filter updates table
17. PASS — Work clear resets status
18. PASS — KPI filters matching task rows
19. PASS — Workflow modal shows connected circle steps
20. PASS — Task detail modal centered
21. PASS — Overview year/date/select sizes equal
22. PASS — Monthly click filters November and selects black-orange gradient
23. PASS — Monthly chart retains 12 month bars
24. PASS — Month click table matches November
25. PASS — Custom date range filters table
26. PASS — Range date inputs share exact field height
27. PASS — No record changes from navigation/filtering
28. PASS — Task legend only task states
29. PASS — One click advances exactly one month
30. PASS — Empty task day has date but no hour grid
31. PASS — Leap-year February contains 29 valid current-month days
32. PASS — Year view contains 12 mini calendars
33. PASS — Leave form centered within content
34. PASS — Manager has personal, personnel, approval tabs
35. PASS — Leave legend only approval states
36. PASS — Leave day always renders 24 hours
37. PASS — Timed leave positioned at 09:00 for 90 minutes
38. PASS — Personal calendar only own leave
39. PASS — Empty leave day still 24 hours
40. PASS — Personnel calendar limited to approver scope
41. PASS — Calendar has no approval actions
42. PASS — Leave history field dimensions match
43. PASS — Own leave history is non-empty
44. PASS — Approvals defaults to pending only
45. PASS — Approval list cannot show own requests
46. PASS — Approving a pending leave stores correct actor/status
47. PASS — Ordinary staff cannot open team overview
48. PASS — Staff has no personnel calendar or approval tab
49. PASS — Leave submit stores true 45-minute interval
50. PASS — Duplicate leave intervals rejected
51. PASS — Finance staff logs in correctly
52. PASS — Finance head logs in correctly
53. PASS — Cross-department badge small with exact wording
54. PASS — Secretary cannot create workload
55. PASS — Secretary task timeline is read-only
56. PASS — Secretary can still submit leave
57. PASS — User records remain after logout
58. PASS — Sidebar logout clears only session
59. PASS — Reload retains existing record bytes
60. PASS — Mobile sidebar opens with overlay
61. PASS — Mobile overlay closes sidebar
62. PASS — No page-wide horizontal overflow on mobile
63. PASS — Mobile grouped account picker fits viewport
64. PASS — No JavaScript page errors
