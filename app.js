document.addEventListener('DOMContentLoaded', () => {

    // --- KONFIGURASI FIREBASE ---
    // GANTI DENGAN KONFIGURASI PROYEK FIREBASE ANDA
    const firebaseConfig = {
        apiKey: "AIzaSyYOUR_API_KEY_HERE",
        authDomain: "your-project-id.firebaseapp.com",
        projectId: "your-project-id",
        storageBucket: "your-project-id.appspot.com",
        messagingSenderId: "1234567890",
        appId: "1:1234567890:web:abcdef1234567890"
    };
    // Inisialisasi Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.firestore();
    const auth = firebase.auth();
    
    // --- KONSTANTA & DATA (disingkat, kode lengkap di bawah) ---
    const PRINTERS = [ { name: "Win Sun", options: [ { label: "Hourly Rental", rate: 148625, unit: "hour" }, { label: "8-Hour Rental (per day)", rate: 3567000 / 3, unit: "8-hour" }, { label: "Daily Rental (24h)", rate: 3567000, unit: "day" }, { label: "Monthly Rental", rate: 108520000, unit: "month" }, { label: "Annual Rental", rate: 1302240000, unit: "year" }, { label: "Purchase (5 Years)", rate: 6511200000, unit: "one-time" } ] }, { name: "GearBuild", options: [ { label: "Hourly Rental", rate: 64057, unit: "hour" }, { label: "8-Hour Rental (per day)", rate: 1537367 / 3, unit: "8-hour" }, { label: "Daily Rental (24h)", rate: 1537367, unit: "day" }, { label: "Monthly Rental", rate: 46121000, unit: "month" }, { label: "Annual Rental", rate: 553425000, unit: "year" }, { label: "Purchase (5 Years)", rate: 2767260000, unit: "one-time" } ] }, { name: "SJ", options: [ { label: "Hourly Rental", rate: 29732, unit: "hour" }, { label: "8-Hour Rental (per day)", rate: 713556 / 3, unit: "8-hour" }, { label: "Daily Rental (24h)", rate: 713556, unit: "day" }, { label: "Monthly Rental", rate: 21704000, unit: "month" }, { label: "Annual Rental", rate: 260448000, unit: "year" }, { label: "Purchase (5 Years)", rate: 1302240000, unit: "one-time" } ] } ];
    const MIX_DESIGNS = [ { name: "Standard Mix", composition: { ink_powder: { kg: 20, volume_m3_in_batch: 0.0216, cost_idr: 20 * 9600 }, portland_cement: { kg: 20, volume_m3_in_batch: 0.0162, cost_idr: 20 * 1375 }, river_sand: { kg: 60, volume_m3_in_batch: 0.0162, cost_idr: 60 * 175 }, plastic_tarpaulin: { unit: 2, volume_m3_in_batch: 0, cost_idr: 19200 }, water: { liter: 14, volume_m3_in_batch: 0.027, cost_idr: 14 * 1400 }, total_volume_per_batch_m3: 0.081, mixing_time_per_batch_hours: 0.25 }, description: "Standard composition for general 3D concrete printing based on new research." }, { name: "High Strength Mix", composition: { ink_powder: { kg: 25, volume_m3_in_batch: 0.045, cost_idr: 240000 }, portland_cement: { kg: 30, volume_m3_in_batch: 0.04, cost_idr: 41250 }, river_sand: { kg: 45, volume_m3_in_batch: 0.025, cost_idr: 7875 }, plastic_tarpaulin: { unit: 2, volume_m3_in_batch: 0, cost_idr: 19200 }, water: { liter: 12, volume_m3_in_batch: 0.045, cost_idr: 16800 }, total_volume_per_batch_m3: 0.155, mixing_time_per_batch_hours: 0.75 }, description: "High strength mix for structural applications." }, { name: "Lightweight Mix", composition: { ink_powder: { kg: 15, volume_m3_in_batch: 0.035, cost_idr: 144000 }, portland_cement: { kg: 15, volume_m3_in_batch: 0.025, cost_idr: 20625 }, river_sand: { kg: 30, volume_m3_in_batch: 0.015, cost_idr: 5250 }, lightweight_aggregate: { kg: 40, volume_m3_in_batch: 0.06, cost_idr: 50000 }, plastic_tarpaulin: { unit: 2, volume_m3_in_batch: 0, cost_idr: 19200 }, water: { liter: 15, volume_m3_in_batch: 0.055, cost_idr: 21000 }, total_volume_per_batch_m3: 0.19, mixing_time_per_batch_hours: 0.6 }, description: "Lightweight mix for non-structural applications." } ];
    const EXCHANGE_RATES_TO_IDR = { 'IDR': 1, 'USD': 16300, 'CNY': 2250, 'EUR': 17500, 'JPY': 105, 'GBP': 20500, 'AUD': 10800, 'CAD': 11800, 'CHF': 18300 };
    const CURRENCY_FORMATS = { 'IDR': { symbol: 'Rp', locale: 'id-ID' }, 'USD': { symbol: '$', locale: 'en-US' }, 'CNY': { symbol: '¥', locale: 'zh-CN' }, 'EUR': { symbol: '€', locale: 'de-DE' }, 'JPY': { symbol: '¥', locale: 'ja-JP' }, 'GBP': { symbol: '£', locale: 'en-GB' }, 'AUD': { symbol: 'A$', locale: 'en-AU' }, 'CAD': { symbol: 'C$', locale: 'en-CA' }, 'CHF': { symbol: 'CHF', locale: 'de-CH' } };
    const rebarWeights = { 8: 0.395, 10: 0.617, 12: 0.888, 13: 1.042, 16: 1.578 };
    const translations = {
    en: { mainTitle: "3D Printed Concrete - Universal Cost Calculator", subtitle: "Calculated Estimated & Should Include a 10-15% Margin", parameters: "Project Parameters", rebar: "Sub Materials - Rebar (Integrated Calculation)", steel: "Steel Structure Costs", transport: "Transportation Costs (Vehicles)", materials: "Raw Materials", equipment: "Equipment & Rentals", labor: "Labor Costs", summary: "Project Cost Summary", history: "Calculation History", support: "Support Our Work", projectName: "Project Name", structureType: "Structure Type", selectCurrency: "Select Currency", length: "Length (mm)", width: "Width (mm)", height: "Height (mm)", totalVolume: "Total Volume (m³)", calculateVolume: "Calculate volume from L, W, H", projectDuration: "Project Duration (days)", printerHoursPerDay: "Printer Hours/Day", mixingHoursPerDay: "Mixing Hours/Day", wastePercentage: "Waste Percentage (%)", nozzleWidth: "Nozzle Width (mm)", nozzleHeight: "Nozzle Height (mm)", note: "Note", noteVolumeDuration: "Total Volume (m³) can be calculated from Length, Width, and Height, or entered manually. Project Duration is automatically calculated based on Total Volume, Daily Operating Hours for Printer (assuming 0.3 m³ material requires 1 hour for printing) AND for Mixing (assuming a 0.081 m³ /batch).", segmentLength: "Segment Length (L) (mm)", segmentWidth: "Segment Width (W) (mm)", segmentHeight: "Segment Height (H) (mm)", numberOfSegments: "Number of Segments (units)", rebarPricePerKg: "Rebar Price (IDR/kg)", calculateRebar: "Calculate Rebar Needs for Segments", totalRebarWeight: "Total Rebar Weight", totalRebarLength: "Total Rebar Length", totalRebarCost: "Total Rebar Cost", totalBars: "Total Bars", rebarDetails: "Rebar Calculation Details per Type", jointType: "Joint Type", totalLength: "Total Length (m)", diameter: "Diameter", numberOfRows: "Number of Rows", overallLength: "Overall Length (m)", weight: "Weight (kg)", rebarCostBreakdownDetails: "Cost Breakdown per Rebar Diameter", rebarNotes: "Rebar Calculation Notes:", rebarNote1: "Calculation is based on the specific segment dimensions and number of segments you input in this section, for on-site assembly.", rebarNote2: "This calculation does NOT automatically scale with the overall 'Total Volume (m³)' of your project. If you manually adjust the project's 'Total Volume' and need the rebar cost to reflect that scale, you must manually adjust the 'Number of Segments' or other dimensions in this section.", rebarNote3: "Rebar is primarily for segment joints and tie structures.", rebarNote4: "Add 10% tolerance for field adjustments.", rebarNote5: "Prepare grooves/channels on segments for rebar placement.", rebarNote6: "Ensure proper alignment before final grouting.", projectVisualization: "Project Visualization", uploadProjectImage: "Upload Project Image:", uploadImageNote: "Uploaded images will appear here. For printed reports, this image will be included.", detailedPrintingGeometry: "Detailed Printing Geometry (for Ink Cost & Volume Reference)", inkWidth: "Ink Width (mm)", inkThickness: "Ink Thickness (mm)", contourLengthPerLayer: "Contour Length per Layer (mm)", totalLayerAmount: "Total Layer Amount", totalExtrusionLength: "Total Extrusion Length (m)", calculatedVolumeFromGeometry: "Calculated Volume from Geometry (m³)", costPerMeterExtrusion: "Cost per Meter Extrusion (IDR)", totalInkExtrusionCost: "Total Ink Extrusion Cost", geometryNote: "The 'Total Volume (m³)' above is the main input for the overall project. Geometry parameters here are used for more detailed ink cost calculation and to provide an alternative volume estimate based on layer dimensions. This Total Ink Extrusion Cost is for reference and NOT included in the project total.", materialComposition: "Material Composition Reference Per Batch", selectMixDesign: "Select Mix Design:", material: "Material", qty: "Qty (Kg/L/Unit)", volume: "Volume (m³)", cost: "Cost", totalPerBatch: "Total per Batch", materialCompositionNote: "This table shows the composition of the selected material batch. Material costs in the 'Raw Materials' section are calculated based on the project volume input you provide.", materialQuantitySummary: "Material Quantity Summary (Per Project)", qtyPerM3: "Qty per m³ (from input)", totalQuantity: "Total Quantity (Kg/Unit)", totalMaterialQuantity: "Total Material Quantity", materialQuantityNote: "Total quantities are calculated based on your project volume. Use this to estimate logistics and procurement needs.", printerSelection: "3D Printer Selection & Equipment & Fixed T&I Rentals", selectPrinterBrand: "Select Printer Brand & Rental Option:", currentlySelected: "Currently selected:", rentalInformation: "Rental Information:", rentalNote: "Prices include operator training and basic maintenance. Purchase options include a 5-year warranty and full technical support.", rawMaterials: "Raw Materials (Per Project Volume)", description: "Description", pricePerUnit: "Price per Unit", use: "Use", totalCost: "Total Cost", totalRawMaterials: "Total Raw Materials per m³", addMaterial: "+ Add Material", generalEquipment: "General Equipment", miscellaneousRentals: "Miscellaneous Rentals & Consumables", equipmentSubtotal: "Equipment Subtotal", addEquipment: "+ Add Equipment", position: "Position", quantity: "Quantity", timeMinutesPerDay: "Time (Minutes/Day)", ratePerHour: "Rate per Hour", totalLaborCost: "Total Labor Cost", addLaborPosition: "+ Add Labor Position", costPerCubicMeter: "Cost per Cubic Meter (m³)", totalProjectVolume: "Total project volume:", totalProject: "TOTAL PROJECT", printReport: "Print Report", exportToImage: "Export to Image", calculationHistory: "Calculation History", yourUserId: "Your User ID:", date: "Date", details: "Details", noHistoryFound: "No history found. Start calculating!", clearAllHistory: "Clear All History", saveCurrentCalculation: "💾 Save Current Calculation", supportOurWork: "Support Our Work", supportNote: "If this calculator has been useful to you, please consider making a small donation to support its development and maintenance. Every contribution helps!", thankYou: "Thank You", generateProposalSnippet: "✨ Generate Mix Recommendation", generating: "Generating...", generatedProposal: "Generated Proposal:", confirmClearHistory: "Confirm Clear History", clearHistoryTitle: "Clear History", clearHistoryMessage: "Are you sure you want to delete all your calculation history? This action cannot be undone.", yesClearAll: "Yes, Clear All", cancel: "Cancel", vehicleDescription: "Vehicle Description", durationUnit: "Duration (Unit)", unitType: "Unit Type", ratePerUnit: "Rate per Unit", transportationCostsSubtotal: "Transportation Costs Subtotal", addTransportItem: "+ Add Transport Item", transportationNote: "These are costs for renting specific transportation vehicles.", wall: "Wall", column: "Column", beam: "Beam", slab: "Slab", custom: "Custom", untitledProject: "Untitled Project", hours: "hours", minutes: "minutes", bars: "bars", inkPowder: "Ink Powder", portlandCement: "Portland Cement", riverSand: "River Sand", plasticTarpaulin: "Plastic/Tarpaulin", water: "Water", lightweightAggregate: "Lightweight Aggregate", equipmentDescription: "Equipment Description", project: "Project", additionalToolsEquipment: "Additional tools and equipment", concreteMixComponents: "Concrete mix components", workersSupervision: "Workers and supervision", steelBarsAccessories: "Steel bars and accessories for segments", additionalSteelElements: "Additional steel elements", vehicleRentalsForTransport: "Vehicle rentals for transport", fixedLaborMachineryForTI: "Fixed labor and machinery for T&I", authenticationNotReady: "Authentication not ready. Cannot perform action.", calculationSaved: "Current calculation saved to history!", errorSavingHistory: "Error saving history", calculationDetails: "Calculation Details", costPerM3: "Cost per m³", totalProjectCost: "Total Project Cost", costBreakdown: "Cost Breakdown", noSuchDocument: "No such document!", errorViewingDetails: "Error viewing details", allHistoryCleared: "All history cleared successfully!", errorClearingHistory: "Error clearing history", failedToExportReport: "Failed to export report to image", reportExported: "Report exported to image!", none: "None", steelUsageTon: "Steel Usage (ton)", steelUnitPriceUsdTon: "Steel Unit Price (USD/ton)", steelStructureNote: "This section calculates the cost of additional steel structures, separate from rebar for concrete reinforcement.", fixedInstallationLabor: "Fixed Installation Labor (USD)", fixedCraneTI: "Fixed Crane T&I (USD)", fixedForkliftTI: "Fixed Forklift T&I (USD)", fixedTransportTruckTI: "Fixed Transport Truck T&I (USD)", fixedCostsNote: "These costs are added as fixed amounts per project. Adjust quantities or rates as needed for your specific project scale." },
    id: { mainTitle: "Kalkulator Biaya Universal Beton Cetak 3D", subtitle: "Estimasi Perhitungan & Seharusnya Mencakup Margin 10-15%", parameters: "Parameter Proyek", rebar: "Sub Material - Besi Beton (Perhitungan Terintegrasi)", steel: "Biaya Struktur Baja", transport: "Biaya Transportasi (Kendaraan)", materials: "Material Mentah", equipment: "Peralatan & Sewa", labor: "Biaya Tenaga Kerja", summary: "Ringkasan Biaya Proyek", history: "Riwayat Perhitungan", support: "Dukung Pekerjaan Kami", projectName: "Nama Proyek", structureType: "Tipe Struktur", selectCurrency: "Pilih Mata Uang", length: "Panjang (mm)", width: "Lebar (mm)", height: "Tinggi (mm)", totalVolume: "Volume Total (m³)", calculateVolume: "Hitung volume dari P, L, T", projectDuration: "Durasi Proyek (hari)", printerHoursPerDay: "Jam Printer/Hari", mixingHoursPerDay: "Jam Pencampuran/Hari", wastePercentage: "Persentase Limbah (%)", nozzleWidth: "Lebar Nozzle (mm)", nozzleHeight: "Tinggi Nozzle (mm)", note: "Catatan", noteVolumeDuration: "Volume Total (m³) dapat dihitung dari Panjang, Lebar, dan Tinggi, atau dimasukkan secara manual. Durasi Proyek dihitung secara otomatis berdasarkan Volume Total, Jam Operasional Harian Printer (asumsi 0.3 m³ material membutuhkan 1 jam untuk pencetakan) DAN untuk Pencampuran (asumsi 0.081 m³ /batch).", segmentLength: "Panjang Segmen (L) (mm)", segmentWidth: "Lebar Segmen (W) (mm)", segmentHeight: "Tinggi Segmen (H) (mm)", numberOfSegments: "Jumlah Segmen (unit)", rebarPricePerKg: "Harga Besi Beton (IDR/kg)", calculateRebar: "Hitung Kebutuhan Besi Beton per Segmen", totalRebarWeight: "Total Berat Besi Beton", totalRebarLength: "Total Panjang Besi Beton", totalRebarCost: "Total Biaya Besi Beton", totalBars: "Total Batang", rebarDetails: "Detail Perhitungan Besi Beton per Tipe", jointType: "Tipe Sambungan", totalLength: "Total Panjang (m)", diameter: "Diameter", numberOfRows: "Jumlah Baris", overallLength: "Panjang Keseluruhan (m)", weight: "Berat (kg)", rebarCostBreakdownDetails: "Rincian Biaya per Diameter Besi Beton", rebarNotes: "Catatan Perhitungan Besi Beton:", rebarNote1: "Perhitungan didasarkan pada dimensi segmen spesifik dan jumlah segmen yang Anda masukkan di bagian ini, untuk perakitan di lokasi.", rebarNote2: "Perhitungan ini TIDAK secara otomatis berskala dengan 'Volume Total (m³)' keseluruhan proyek Anda. Jika Anda menyesuaikan 'Volume Total' proyek secara manual dan perlu biaya besi beton untuk mencerminkan skala tersebut, Anda harus menyesuaikan 'Jumlah Segmen' atau dimensi lain di bagian ini secara manual.", rebarNote3: "Besi beton terutama untuk sambungan segmen dan struktur pengikat.", rebarNote4: "Tambahkan toleransi 10% untuk penyesuaian lapangan.", rebarNote5: "Siapkan alur/saluran pada segmen untuk penempatan besi beton.", rebarNote6: "Pastikan penyelarasan yang tepat sebelum grouting akhir.", projectVisualization: "Visualisasi Proyek", uploadProjectImage: "Unggah Gambar Proyek:", uploadImageNote: "Gambar yang diunggah akan muncul di sini. Untuk laporan cetak, gambar ini akan disertakan.", detailedPrintingGeometry: "Geometri Pencetakan Terperinci (untuk Referensi Biaya & Volume Tinta)", inkWidth: "Lebar Tinta (mm)", inkThickness: "Ketebalan Tinta (mm)", contourLengthPerLayer: "Panjang Kontur per Lapisan (mm)", totalLayerAmount: "Jumlah Lapisan Total", totalExtrusionLength: "Total Panjang Ekstrusi (m)", calculatedVolumeFromGeometry: "Volume Dihitung dari Geometri (m³)", costPerMeterExtrusion: "Biaya per Meter Ekstrusi (IDR)", totalInkExtrusionCost: "Total Biaya Ekstrusi Tinta", geometryNote: "Volume Total (m³) di atas adalah input utama untuk keseluruhan proyek. Parameter geometri di sini digunakan untuk perhitungan biaya tinta yang lebih rinci dan untuk memberikan perkiraan volume alternatif berdasarkan dimensi lapisan. Total Biaya Ekstrusi Tinta ini hanya untuk referensi dan TIDAK termasuk dalam total proyek.", materialComposition: "Referensi Komposisi Material per Batch", selectMixDesign: "Pilih Desain Campuran:", material: "Material", qty: "Kuantitas (Kg/L/Unit)", volume: "Volume (m³)", cost: "Biaya", totalPerBatch: "Total per Batch", materialCompositionNote: "Tabel ini menunjukkan komposisi batch material yang dipilih. Biaya material di bagian 'Material Mentah' dihitung berdasarkan volume proyek yang Anda berikan.", materialQuantitySummary: "Ringkasan Kuantitas Material (per Proyek)", qtyPerM3: "Kuantitas per m³ (dari input)", totalQuantity: "Total Kuantitas (Kg/Unit)", totalMaterialQuantity: "Total Kuantitas Material", materialQuantityNote: "Total kuantitas dihitung berdasarkan volume proyek Anda. Gunakan ini untuk memperkirakan kebutuhan logistik dan pengadaan.", printerSelection: "Pemilihan Printer 3D & Sewa Peralatan", selectPrinterBrand: "Pilih Merek Printer & Opsi Sewa:", currentlySelected: "Saat ini dipilih:", rentalInformation: "Informasi Sewa:", rentalNote: "Harga termasuk pelatihan operator dan pemeliharaan dasar. Opsi pembelian termasuk garansi 5 tahun dan dukungan teknis penuh.", rawMaterials: "Material Mentah (per Volume Proyek)", description: "Deskripsi", pricePerUnit: "Harga per Unit", use: "Gunakan", totalCost: "Total Biaya", totalRawMaterials: "Total Material Mentah per m³", addMaterial: "+ Tambah Material", generalEquipment: "Peralatan Umum", miscellaneousRentals: "Sewa & Konsumsi Lain-lain", equipmentSubtotal: "Subtotal Peralatan", addEquipment: "+ Tambah Peralatan", position: "Posisi", quantity: "Kuantitas", timeMinutesPerDay: "Waktu (Menit/Hari)", ratePerHour: "Tarif per Jam", totalLaborCost: "Total Biaya Tenaga Kerja", addLaborPosition: "+ Tambah Posisi Tenaga Kerja", costPerCubicMeter: "Biaya per Meter Kubik (m³)", totalProjectVolume: "Volume total proyek:", totalProject: "TOTAL PROYEK", printReport: "Cetak Laporan", exportToImage: "Ekspor ke Gambar", calculationHistory: "Riwayat Perhitungan", yourUserId: "ID Pengguna Anda:", date: "Tanggal", details: "Detail", noHistoryFound: "Tidak ada riwayat ditemukan. Mulai menghitung!", clearAllHistory: "Hapus Semua Riwayat", saveCurrentCalculation: "💾 Simpan Perhitungan Saat Ini", supportOurWork: "Dukung Pekerjaan Kami", supportNote: "Jika kalkulator ini bermanfaat bagi Anda, silakan pertimbangkan untuk memberikan donasi kecil untuk mendukung pengembangan dan pemeliharaannya. Setiap kontribusi membantu!", thankYou: "Terima Kasih", generateProposalSnippet: "✨ Hasilkan Cuplikan Proposal", generating: "Menghasilkan...", generatedProposal: "Proposal yang Dihasilkan:", confirmClearHistory: "Konfirmasi Hapus Riwayat", clearHistoryTitle: "Hapus Riwayat", clearHistoryMessage: "Apakah Anda yakin ingin menghapus semua riwayat perhitungan Anda? Tindakan ini tidak dapat dibatalkan.", yesClearAll: "Ya, Hapus Semua", cancel: "Batal", vehicleDescription: "Deskripsi Kendaraan", durationUnit: "Durasi (Unit)", unitType: "Tipe Unit", ratePerUnit: "Tarif per Unit", transportationCostsSubtotal: "Subtotal Biaya Transportasi", addTransportItem: "+ Tambah Item Transportasi", transportationNote: "Ini adalah biaya untuk menyewa kendaraan transportasi tertentu.", wall: "Dinding", column: "Kolom", beam: "Balok", slab: "Pelat", custom: "Kustom", untitledProject: "Proyek Tanpa Nama", hours: "jam", minutes: "menit", bars: "batang", inkPowder: "Bubuk Tinta", portlandCement: "Semen Portland", riverSand: "Pasir Sungai", plasticTarpaulin: "Plastik/Terpal", water: "Air", lightweightAggregate: "Agregat Ringan", equipmentDescription: "Deskripsi Peralatan", project: "Proyek", additionalToolsEquipment: "Alat dan peralatan tambahan", concreteMixComponents: "Komponen campuran beton", workersSupervision: "Pekerja dan pengawasan", steelBarsAccessories: "Besi baja dan aksesori untuk segmen", additionalSteelElements: "Elemen baja tambahan", vehicleRentalsForTransport: "Sewa kendaraan untuk transportasi", fixedLaborMachineryForTI: "Tenaga kerja tetap dan mesin untuk T&I", authenticationNotReady: "Autentikasi belum siap. Tidak dapat melakukan tindakan.", calculationSaved: "Perhitungan saat ini disimpan ke riwayat!", errorSavingHistory: "Kesalahan saat menyimpan riwayat", calculationDetails: "Detail Perhitungan", costPerM3: "Biaya per m³", totalProjectCost: "Total Biaya Proyek", costBreakdown: "Rincian Biaya", noSuchDocument: "Dokumen tidak ditemukan!", errorViewingDetails: "Kesalahan saat melihat detail", allHistoryCleared: "Semua riwayat berhasil dihapus!", errorClearingHistory: "Kesalahan saat menghapus riwayat", failedToExportReport: "Gagal mengekspor laporan ke gambar", reportExported: "Laporan berhasil diekspor ke gambar!", none: "Tidak ada", steelUsageTon: "Penggunaan Baja (ton)", steelUnitPriceUsdTon: "Harga Satuan Baja (USD/ton)", steelStructureNote: "Bagian ini menghitung biaya struktur baja tambahan, terpisah dari besi beton untuk tulangan beton.", fixedInstallationLabor: "Tenaga Kerja Instalasi Tetap (USD)", fixedCraneTI: "Biaya Crane T&I Tetap (USD)", fixedForkliftTI: "Biaya Forklift T&I Tetap (USD)", fixedTransportTruckTI: "Biaya Truk Transportasi T&I Tetap (USD)", fixedCostsNote: "Biaya-biaya ini ditambahkan sebagai jumlah tetap per proyek. Sesuaikan kuantitas atau tarif sesuai kebutuhan skala proyek spesifik Anda." },
    zh: { mainTitle: "3D打印混凝土通用成本计算器", subtitle: "计算估算并应包含10-15%的利润", parameters: "项目参数", rebar: "子材料 - 钢筋 (集成计算)", steel: "钢结构成本", transport: "运输成本 (车辆)", materials: "原材料", equipment: "设备与租赁", labor: "劳务成本", summary: "项目成本摘要", history: "计算历史", support: "支持我们的工作", projectName: "项目名称", structureType: "结构类型", selectCurrency: "选择货币", length: "长度 (毫米)", width: "宽度 (毫米)", height: "高度 (毫米)", totalVolume: "总体积 (立方米)", calculateVolume: "从长、宽、高计算体积", projectDuration: "项目持续时间 (天)", printerHoursPerDay: "打印机每日工作小时数", mixingHoursPerDay: "搅拌每日工作小时数", wastePercentage: "废品率 (%)", nozzleWidth: "喷嘴宽度 (毫米)", nozzleHeight: "喷嘴高度 (毫米)", note: "注意", noteVolumeDuration: "总体积 (m³) 可以从长度、宽度和高度计算，或手动输入。项目持续时间根据总体积、打印机每日运行小时数（假设0.3 m³材料需要1小时打印）和搅拌（假设每批0.081 m³）自动计算。", segmentLength: "节段长度 (L) (毫米)", segmentWidth: "节段宽度 (W) (毫米)", segmentHeight: "节段高度 (H) (毫米)", numberOfSegments: "节段数量 (单位)", rebarPricePerKg: "钢筋价格 (印尼盾/公斤)", calculateRebar: "计算节段钢筋需求", totalRebarWeight: "钢筋总重量", totalRebarLength: "钢筋总长度", totalRebarCost: "钢筋总成本", totalBars: "总钢筋", rebarDetails: "各类型钢筋计算详情", jointType: "接头类型", totalLength: "总长度 (米)", diameter: "直径", numberOfRows: "行数", overallLength: "总长度 (米)", weight: "重量 (公斤)", rebarCostBreakdownDetails: "各钢筋直径成本明细", rebarNotes: "钢筋计算注意事项:", rebarNote1: "计算基于您在此部分输入的具体节段尺寸和节段数量，用于现场组装。", rebarNote2: "此计算不自动按项目总体积 (m³) 进行缩放。如果您手动调整项目总体积并需要钢筋成本反映该比例，您必须手动调整此部分中的节段数量或其他尺寸。", rebarNote3: "钢筋主要用于节段接头和连接结构。", rebarNote4: "为现场调整增加10%的容差。", rebarNote5: "在节段上准备钢筋放置的凹槽/通道。", rebarNote6: "在最终灌浆前确保正确对齐。", projectVisualization: "项目可视化", uploadProjectImage: "上传项目图片:", uploadImageNote: "上传的图片将显示在此处。对于打印报告，此图片将包含在内。", detailedPrintingGeometry: "详细打印几何 (墨水成本与体积参考)", inkWidth: "墨水宽度 (毫米)", inkThickness: "墨水厚度 (毫米)", contourLengthPerLayer: "每层轮廓长度 (毫米)", totalLayerAmount: "总层数", totalExtrusionLength: "总挤出长度 (米)", calculatedVolumeFromGeometry: "从几何计算的体积 (立方米)", costPerMeterExtrusion: "每米挤出成本 (印尼盾)", totalInkExtrusionCost: "总墨水挤出成本", geometryNote: "上述“总体积 (m³)”是项目的主要输入。此处的几何参数用于更详细的墨水成本计算，并根据层尺寸提供替代体积估算。此总墨水挤出成本仅供参考，不包含在项目总成本中。", materialComposition: "每批材料成分参考", selectMixDesign: "选择混合设计:", material: "材料", qty: "数量 (公斤/升/单位)", volume: "体积 (立方米)", cost: "成本", totalPerBatch: "每批总计", materialCompositionNote: "此表显示所选材料批次的成分。'原材料'部分的材料成本根据您提供的项目体积输入进行计算。", materialQuantitySummary: "材料数量摘要 (按项目)", qtyPerM3: "每立方米数量 (来自输入)", totalQuantity: "总数量 (公斤/单位)", totalMaterialQuantity: "总材料数量", materialQuantityNote: "总数量根据您的项目体积计算。使用此信息估算物流和采购需求。", printerSelection: "3D打印机选择与设备及固定运输安装租赁", selectPrinterBrand: "选择打印机品牌与租赁选项:", currentlySelected: "当前选择:", rentalInformation: "租赁信息:", rentalNote: "价格包括操作员培训和基本维护。购买选项包括5年保修和全面的技术支持。", rawMaterials: "原材料 (按项目体积)", description: "描述", pricePerUnit: "单位价格", use: "使用", totalCost: "总成本", totalRawMaterials: "每立方米原材料总计", addMaterial: "+ 添加材料", generalEquipment: "通用设备", miscellaneousRentals: "杂项租赁与消耗品", equipmentSubtotal: "设备小计", addEquipment: "+ 添加设备", position: "职位", quantity: "数量", timeMinutesPerDay: "时间 (分钟/天)", ratePerHour: "每小时费率", totalLaborCost: "劳务总成本", addLaborPosition: "+ 添加劳务职位", costPerCubicMeter: "每立方米成本 (立方米)", totalProjectVolume: "项目总体积:", totalProject: "项目总计", printReport: "打印报告", exportToImage: "导出为图片", calculationHistory: "计算历史", yourUserId: "您的用户ID:", date: "日期", details: "详情", noHistoryFound: "未找到历史记录。开始计算！", clearAllHistory: "清除所有历史记录", saveCurrentCalculation: "💾 保存当前计算", supportOurWork: "支持我们的工作", supportNote: "如果此计算器对您有用，请考虑进行小额捐赠以支持其开发和维护。每一份贡献都有帮助！", thankYou: "谢谢", generateProposalSnippet: "✨ 生成提案片段", generating: "正在生成...", generatedProposal: "生成的提案:", confirmClearHistory: "确认清除历史记录", clearHistoryTitle: "清除历史记录", clearHistoryMessage: "您确定要删除所有计算历史记录吗？此操作无法撤销。", yesClearAll: "是的，清除所有", cancel: "取消", vehicleDescription: "车辆描述", durationUnit: "持续时间 (单位)", unitType: "单位类型", ratePerUnit: "单位费率", transportationCostsSubtotal: "运输成本小计", addTransportItem: "+ 添加运输项目", transportationNote: "这些是租赁特定运输车辆的成本。", wall: "墙", column: "柱", beam: "梁", slab: "板", custom: "自定义", untitledProject: "无标题项目", hours: "小时", minutes: "分钟", bars: "条", inkPowder: "墨粉", portlandCement: "波特兰水泥", riverSand: "河沙", plasticTarpaulin: "塑料/防水布", water: "水", lightweightAggregate: "轻质骨料", equipmentDescription: "设备描述", project: "项目", additionalToolsEquipment: "附加工具和设备", concreteMixComponents: "混凝土混合成分", workersSupervision: "工人和监督", steelBarsAccessories: "钢筋和配件", additionalSteelElements: "附加钢结构件", vehicleRentalsForTransport: "车辆租赁用于运输", fixedLaborMachineryForTI: "固定劳务和机械用于运输和安装", authenticationNotReady: "认证未就绪。无法执行操作。", calculationSaved: "当前计算已保存到历史记录！", errorSavingHistory: "保存历史记录时出错", calculationDetails: "计算详情", costPerM3: "每立方米成本", totalProjectCost: "项目总成本", costBreakdown: "成本明细", noSuchDocument: "无此文档！", errorViewingDetails: "查看详情时出错", allHistoryCleared: "所有历史记录已成功清除！", errorClearingHistory: "清除历史记录时出错", failedToExportReport: "导出报告到图片失败", reportExported: "报告已成功导出到图片！", none: "无", steelUsageTon: "钢材用量 (吨)", steelUnitPriceUsdTon: "钢材单价 (美元/吨)", steelStructureNote: "本节计算附加钢结构件的成本，与混凝土加固钢筋分开。", fixedInstallationLabor: "固定安装劳务 (美元)", fixedCraneTI: "固定起重机运输安装 (美元)", fixedForkliftTI: "固定叉车运输安装 (美元)", fixedTransportTruckTI: "固定运输卡车运输安装 (美元)", fixedCostsNote: "这些成本作为固定金额添加。根据您的具体项目规模调整数量或费率。" },
    de: { mainTitle: "3D-gedruckter Beton - Universal-Kostenrechner", subtitle: "Berechnete Schätzung & sollte eine Marge von 10-15% enthalten", parameters: "Projektparameter", rebar: "Unter-Materialien - Bewehrung (Integrierte Berechnung)", steel: "Stahlstrukturkosten", transport: "Transportkosten (Fahrzeuge)", materials: "Rohmaterialien", equipment: "Ausrüstung & Mieten", labor: "Arbeitskosten", summary: "Projektkostenübersicht", history: "Berechnungsverlauf", support: "Unterstützen Sie unsere Arbeit", projectName: "Projektname", structureType: "Strukturtyp", selectCurrency: "Währung auswählen", length: "Länge (mm)", width: "Breite (mm)", height: "Höhe (mm)", totalVolume: "Gesamtvolumen (m³)", calculateVolume: "Volumen aus L, B, H berechnen", projectDuration: "Projektdauer (Tage)", printerHoursPerDay: "Drucker Stunden/Tag", mixingHoursPerDay: "Mischstunden/Tag", wastePercentage: "Abfallprozentsatz (%)", nozzleWidth: "Düsenbreite (mm)", nozzleHeight: "Düsenhöhe (mm)", note: "Hinweis", noteVolumeDuration: "Das Gesamtvolumen (m³) kann aus Länge, Breite und Höhe berechnet oder manuell eingegeben werden. Die Projektdauer wird automatisch basierend auf dem Gesamtvolumen, den täglichen Betriebsstunden für den Drucker (angenommen 0,3 m³ Material benötigt 1 Stunde zum Drucken) UND für das Mischen (angenommen 0,081 m³ / Charge) berechnet.", segmentLength: "Segmentlänge (L) (mm)", segmentWidth: "Segmentbreite (W) (mm)", segmentHeight: "Segmenthöhe (H) (mm)", numberOfSegments: "Anzahl der Segmente (Einheiten)", rebarPricePerKg: "Bewehrungspreis (IDR/kg)", calculateRebar: "Bewehrungsbedarf für Segmente berechnen", totalRebarWeight: "Gesamtgewicht der Bewehrung", totalRebarLength: "Gesamtlänge der Bewehrung", totalRebarCost: "Gesamtkosten der Bewehrung", totalBars: "Gesamtstäbe", rebarDetails: "Bewehrungsberechnungsdetails pro Typ", jointType: "Gelenktyp", totalLength: "Gesamtlänge (m)", diameter: "Durchmesser", numberOfRows: "Anzahl der Reihen", overallLength: "Gesamtlänge (m)", weight: "Gewicht (kg)", rebarCostBreakdownDetails: "Kostenaufschlüsselung pro Bewehrungsdurchmesser", rebarNotes: "Bewehrungsberechnungs-Hinweise:", rebarNote1: "Die Berechnung basiert auf den spezifischen Segmentabmessungen und der Anzahl der Segmente, die Sie in diesem Abschnitt für die Vor-Ort-Montage eingeben.", rebarNote2: "Diese Berechnung skaliert NICHT automatisch mit dem gesamten 'Gesamtvolumen (m³)' Ihres Projekts. Wenn Sie das 'Gesamtvolumen' des Projekts manuell anpassen und die Bewehrungskosten diese Skalierung widerspiegeln sollen, müssen Sie die 'Anzahl der Segmente' oder andere Abmessungen in diesem Abschnitt manuell anpassen.", rebarNote3: "Bewehrung dient hauptsächlich für Segmentverbindungen und Bindungsstrukturen.", rebarNote4: "Fügen Sie 10% Toleranz für Feldanpassungen hinzu.", rebarNote5: "Bereiten Sie Nuten/Kanäle an Segmenten für die Bewehrungsplatzierung vor.", rebarNote6: "Stellen Sie die richtige Ausrichtung vor dem endgültigen Vergießen sicher.", projectVisualization: "Projektvisualisierung", uploadProjectImage: "Projektbild hochladen:", uploadImageNote: "Hochgeladene Bilder werden hier angezeigt. Für gedruckte Berichte wird dieses Bild enthalten sein.", detailedPrintingGeometry: "Detaillierte Druckgeometrie (für Tintenkosten & Volumenreferenz)", inkWidth: "Tintenbreite (mm)", inkThickness: "Tintenstärke (mm)", contourLengthPerLayer: "Konturlänge pro Schicht (mm)", totalLayerAmount: "Gesamtschichtanzahl", totalExtrusionLength: "Gesamtextrusionslänge (m)", calculatedVolumeFromGeometry: "Berechnetes Volumen aus Geometrie (m³)", costPerMeterExtrusion: "Kosten pro Meter Extrusion (IDR)", totalInkExtrusionCost: "Gesamttintenkosten", geometryNote: "Das oben genannte 'Gesamtvolumen (m³)' ist die Haupteingabe für das Gesamtprojekt. Die Geometrieparameter hier werden für eine detailliertere Tintenkostenberechnung verwendet und um eine alternative Volumenschätzung basierend auf den Schichtabmessungen zu liefern. Diese Gesamttintenkosten dienen nur als Referenz und sind NICHT in den Projektgesamtkosten enthalten.", materialComposition: "Materialzusammensetzungsreferenz pro Charge", selectMixDesign: "Mischungsdesign auswählen:", material: "Material", qty: "Menge (kg/L/Einheit)", volume: "Volumen (m³)", cost: "Kosten", totalPerBatch: "Gesamt pro Charge", materialCompositionNote: "Diese Tabelle zeigt die Zusammensetzung der ausgewählten Materialcharge. Die Materialkosten im Abschnitt 'Rohmaterialien' werden basierend auf der von Ihnen angegebenen Projektvolumeneingabe berechnet.", materialQuantitySummary: "Materialmengenübersicht (pro Projekt)", qtyPerM3: "Menge pro m³ (aus Eingabe)", totalQuantity: "Gesamtmenge (kg/Einheit)", totalMaterialQuantity: "Gesamtmaterialmenge", materialQuantityNote: "Die Gesamtmengen werden basierend auf Ihrem Projektvolumen berechnet. Verwenden Sie dies, um Logistik- und Beschaffungsbedürfnisse abzuschätzen.", printerSelection: "3D-Drucker-Auswahl & Ausrüstungs- & feste T&I-Mieten", selectPrinterBrand: "Druckermarke & Mietoption auswählen:", currentlySelected: "Aktuell ausgewählt:", rentalInformation: "Mietinformationen:", rentalNote: "Die Preise beinhalten Bedienerschulung und grundlegende Wartung. Kaufoptionen beinhalten eine 5-Jahres-Garantie und vollständigen technischen Support.", rawMaterials: "Rohmaterialien (pro Projektvolumen)", description: "Beschreibung", pricePerUnit: "Preis pro Einheit", use: "Verwenden", totalCost: "Gesamtkosten", totalRawMaterials: "Gesamte Rohmaterialien pro m³", addMaterial: "+ Material hinzufügen", generalEquipment: "Allgemeine Ausrüstung", miscellaneousRentals: "Sonstige Mieten & Verbrauchsmaterialien", equipmentSubtotal: "Ausrüstung Zwischensumme", addEquipment: "+ Ausrüstung hinzufügen", position: "Position", quantity: "Menge", timeMinutesPerDay: "Zeit (Minuten/Tag)", ratePerHour: "Stundensatz", totalLaborCost: "Gesamtarbeitskosten", addLaborPosition: "+ Arbeitsposition hinzufügen", costPerCubicMeter: "Kosten pro Kubikmeter (m³)", totalProjectVolume: "Gesamtprojektvolumen:", totalProject: "GESAMTPROJEKT", printReport: "Bericht drucken", exportToImage: "Als Bild exportieren", calculationHistory: "Berechnungsverlauf", yourUserId: "Ihre Benutzer-ID:", date: "Datum", details: "Details", noHistoryFound: "Kein Verlauf gefunden. Starten Sie die Berechnung!", clearAllHistory: "Gesamten Verlauf löschen", saveCurrentCalculation: "💾 Aktuelle Berechnung speichern", supportOurWork: "Unterstützen Sie unsere Arbeit", supportNote: "Wenn dieser Rechner für Sie nützlich war, ziehen Sie bitte eine kleine Spende in Betracht, um seine Entwicklung und Wartung zu unterstützen. Jeder Beitrag hilft!", thankYou: "Vielen Dank", generateProposalSnippet: "✨ Angebotsausschnitt generieren", generating: "Wird generiert...", generatedProposal: "Generiertes Angebot:", confirmClearHistory: "Verlauf löschen bestätigen", clearHistoryTitle: "Verlauf löschen", clearHistoryMessage: "Möchten Sie wirklich den gesamten Berechnungsverlauf löschen? Diese Aktion kann nicht rückgängig gemacht werden.", yesClearAll: "Ja, alles löschen", cancel: "Abbrechen", vehicleDescription: "Fahrzeugbeschreibung", durationUnit: "Dauer (Einheit)", unitType: "Einheitstyp", ratePerUnit: "Rate pro Einheit", transportationCostsSubtotal: "Transportkosten Zwischensumme", addTransportItem: "+ Transportelement hinzufügen", transportationNote: "Dies sind die Kosten für die Anmietung bestimmter Transportfahrzeuge.", wall: "Wand", column: "Säule", beam: "Balken", slab: "Platte", custom: "Benutzerdefiniert", untitledProject: "Unbenanntes Projekt", hours: "Stunden", minutes: "Minuten", bars: "Stäbe", inkPowder: "Tintenpulver", portlandCement: "Portlandzement", riverSand: "Flusssand", plasticTarpaulin: "Plastikplane", water: "Wasser", lightweightAggregate: "Leichtzuschlagstoff", equipmentDescription: "Ausrüstungsbeschreibung", project: "Projekt", additionalToolsEquipment: "Zusätzliche Werkzeuge und Ausrüstung", concreteMixComponents: "Betonmischungsbestandteile", workersSupervision: "Arbeiter und Aufsicht", steelBarsAccessories: "Stahlstangen und Zubehör", additionalSteelElements: "Zusätzliche Stahlelemente", vehicleRentalsForTransport: "Fahrzeugvermietung für den Transport", fixedLaborMachineryForTI: "Feste Arbeitskräfte und Maschinen für T&I", authenticationNotReady: "Authentifizierung nicht bereit. Aktion kann nicht ausgeführt werden.", calculationSaved: "Aktuelle Berechnung wurde im Verlauf gespeichert!", errorSavingHistory: "Fehler beim Speichern des Verlaufs", calculationDetails: "Berechnungsdetails", costPerM3: "Kosten pro m³", totalProjectCost: "Gesamtprojektkosten", costBreakdown: "Kostenaufschlüsselung", noSuchDocument: "Dokument nicht gefunden!", errorViewingDetails: "Fehler beim Anzeigen der Details", allHistoryCleared: "Der gesamte Verlauf wurde erfolgreich gelöscht!", errorClearingHistory: "Fehler beim Löschen des Verlaufs", failedToExportReport: "Fehler beim Exportieren des Berichts als Bild", reportExported: "Bericht erfolgreich als Bild exportiert!", none: "Keine", steelUsageTon: "Stahlverbrauch (Tonnen)", steelUnitPriceUsdTon: "Stahlstückpreis (USD/Tonne)", steelStructureNote: "Dieser Abschnitt berechnet die Kosten für zusätzliche Stahlstrukturen, getrennt von der Bewehrung für Betonverstärkung.", fixedInstallationLabor: "Feste Installationsarbeit (USD)", fixedCraneTI: "Feste Kran T&I (USD)", fixedForkliftTI: "Feste Gabelstapler T&I (USD)", fixedTransportTruckTI: "Feste Transport-LKW T&I (USD)", fixedCostsNote: "Diese Kosten werden als feste Beträge pro Projekt hinzugefügt. Passen Sie Mengen oder Raten nach Bedarf an Ihre spezifische Projektgröße an." }
};
    // ... (sisa data konstanta)

    // --- GLOBAL STATE ---
    let appState = {
        language: 'id',
        userId: 'Loading...',
        isAuthReady: false,
        history: [],
        sectionVisibility: {
             'project-parameters': true,
             'rebar': true,
             'steel-structure': true,
             'transportation-costs': true,
             'project-visualization': false,
             'printing-geometry': false,
             'material-composition': false,
             'material-quantity': true,
             'printer-selection': true,
             'raw-materials': true,
             'equipment': true,
             'labor': true,
             'cost-summary': true,
             'history': false,
             'support': false
        },
        // --- INPUTS ---
        projectName: '',
        structureType: 'wall',
        selectedCurrencyCode: 'IDR',
        length_mm: 10000,
        width_mm: 5000,
        height_mm: 3000,
        total_volume: 0,
        calc_volume_from_lwh: true,
        printer_operating_hours_per_day: 8,
        mixing_operating_hours_per_day: 8,
        waste_percentage: 10,
        nozzle_width: 50,
        nozzle_height: 25,
        rebar_length_mm: 8240,
        rebar_width_mm: 1440,
        rebar_height_mm: 170,
        rebar_segments: 6,
        rebar_price_per_kg: 18000,
        steel_usage_ton: 0.25,
        steel_price_per_ton_usd: 800,
        ink_width_mm: 50,
        ink_thickness_mm: 25,
        contour_length_per_layer_mm: 30000,
        layer_amount: 120,
        ink_extrusion_cost_per_meter: 5000,
        selectedPrinter: PRINTERS[0],
        selectedPrinterOption: PRINTERS[0].options[0],
        selectedMixDesignIndex: 0,
        projectImagePreview: "https://placehold.co/600x400/EAEFF5/666666?text=Project+Image",
        materials: [
            { id: 'ink_powder', name: 'Ink Powder', description: 'Cost: $600/ton (~9600 IDR/Kg)', qty_per_m3: 0, price_per_unit: 9600, unit: 'Kg/m³', use: true, originalValue: null },
            { id: 'portland_cement', name: 'Portland Cement', description: 'Red Lion Brand', qty_per_m3: 0, price_per_unit: 1375, unit: 'Kg/m³', use: true, originalValue: null },
            { id: 'river_sand', name: 'River Sand', description: 'From Karangasem, coarse aggregate', qty_per_m3: 0, price_per_unit: 175, unit: 'Kg/m³', use: true, originalValue: null },
            { id: 'plastic_tarpaulin', name: 'Plastic/Tarpaulin', description: '10% Unit/cost for curing', qty_per_m3: 0, price_per_unit: 19200, unit: 'Unit/m³', use: true, originalValue: null },
            { id: 'water', name: 'Water', description: 'Clean Water, for mixing and curing', qty_per_m3: 0, price_per_unit: 1400, unit: 'L/m³', use: true, originalValue: null },
        ],
        equipment: [
            { id: 'concrete_mixer', name: 'Concrete Mixer Rental (manual pour)', qty: 24, unit_type: 'Hours', rate_per_unit: 20833, use: true, originalValue: null },
            { id: 'compressor', name: 'Compressor Rental for Tools', qty: 24, unit_type: 'Hours', rate_per_unit: 8333, use: true, originalValue: null },
            { id: 'angle_grinder', name: 'Angle Grinder', qty: 24, unit_type: 'Hours', rate_per_unit: 8333, use: true, originalValue: null },
            { id: 'brushless_drill', name: 'Brushless Drill', qty: 1, unit_type: 'Unit', rate_per_unit: 100000, use: true, originalValue: null },
            { id: 'fuel_power', name: 'Fuel & Power Consumption', qty: 24, unit_type: 'Hours', rate_per_unit: 12500, use: true, originalValue: null },
        ],
        transportItems: [
            { id: 'mobile_crane', name: 'Mobile Crane', qty: 8, unit_type: 'Hours', rate_per_unit: 812500, use: true, originalValue: null },
            { id: 'truck_crane', name: 'Truck Crane', qty: 8, unit_type: 'Hours', rate_per_unit: 500000, use: true, originalValue: null },
            { id: 'truck_rental', name: 'Truck', qty: 8, unit_type: 'Hours', rate_per_unit: 375000, use: true, originalValue: null },
            { id: 'forklift', name: 'Forklift', qty: 8, unit_type: 'Hours', rate_per_unit: 275000, use: true, originalValue: null },
            { id: 'pickup_rental', name: 'Pickup', qty: 1, unit_type: 'Trip', rate_per_unit: 450000, use: true, originalValue: null },
        ],
        labor: [
            { id: 'field_worker', name: 'Field Worker', description: '250K IDR / 8 Hours', qty: 2, time_minutes_per_day: 480, rate_per_hour: 31250, use: true, originalValue: null },
            { id: 'op_leader', name: 'OP Leader', description: '500K IDR / 8 Hours', qty: 1, time_minutes_per_day: 480, rate_per_hour: 62500, use: true, originalValue: null },
            { id: 'mixing_crew', name: 'Mixing Crew', description: 'Per Batch Mixing', qty: 2, time_minutes_per_day: 480, rate_per_hour: 30000, use: true, originalValue: null },
            { id: 'printer_operator', name: 'Printer Operator', description: 'Per Printer Operation', qty: 1, time_minutes_per_day: 480, rate_per_hour: 40000, use: true, originalValue: null },
            { id: 'daily_worker', name: 'Daily Worker (Load/Unload)', description: '200K IDR / 8 Hours', qty: 0, time_minutes_per_day: 480, rate_per_hour: 25000, use: true, originalValue: null },
        ],
    };

    // --- UTILITY FUNCTIONS ---
    const t = (key) => translations[appState.language]?.[key] || key;
    
    const formatCost = (amountInIDR) => {
        if (typeof amountInIDR !== 'number' || isNaN(amountInIDR)) {
            amountInIDR = 0;
        }
        const rate = EXCHANGE_RATES_TO_IDR[appState.selectedCurrencyCode];
        const value = amountInIDR / rate;
        const format = CURRENCY_FORMATS[appState.selectedCurrencyCode];
        let formatted = new Intl.NumberFormat(format.locale, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
        let output = `${format.symbol} ${formatted}`;

        if (appState.selectedCurrencyCode !== 'USD') {
            const usdAmount = amountInIDR / EXCHANGE_RATES_TO_IDR['USD'];
            output += ` <span class="usd-currency">(${usdAmount.toFixed(2)} USD)</span>`;
        }
        return output;
    };

    const formatQuantity = (amount, unit) => {
        if (typeof amount !== 'number' || isNaN(amount)) {
            return `N/A ${unit}`;
        }
        return `${amount.toFixed(2)} ${unit}`;
    };

    const showMessageBox = (content, type = 'info', title = null, closable = true, onConfirm = null) => {
        const container = document.getElementById('message-box-container');
        container.innerHTML = '';
        const box = document.createElement('div');
        box.className = `bg-white p-6 rounded-lg shadow-xl max-w-lg w-full text-center relative ${type === 'error' ? 'border-2 border-red-500' : 'border-2 border-blue-500'}`;
        
        let html = '';
        if (closable) {
            html += `<button class="close-modal-btn absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-3xl">&times;</button>`;
        }
        if (title) {
            html += `<h3 class="text-xl font-semibold mb-4 text-gray-800">${title}</h3>`;
        }
        html += `<div class="text-gray-700">${typeof content === 'string' ? content : ''}</div>`;
        
        box.innerHTML = html;
        if (typeof content !== 'string') {
             box.querySelector('.text-gray-700').appendChild(content);
        }

        container.appendChild(box);
        container.classList.remove('hidden');

        container.addEventListener('click', (e) => {
            if (e.target === container || e.target.classList.contains('close-modal-btn') || e.target.classList.contains('cancel-btn')) {
                container.classList.add('hidden');
            }
        });
    };
    
    // --- MAIN CALCULATION LOGIC ---
    function calculateAllValues() {
        let current_total_volume_calc;
        if (appState.calc_volume_from_lwh) {
            current_total_volume_calc = (parseFloat(appState.length_mm) || 0) / 1000 * (parseFloat(appState.width_mm) || 0) / 1000 * (parseFloat(appState.height_mm) || 0) / 1000;
            appState.total_volume = current_total_volume_calc;
        } else {
            current_total_volume_calc = parseFloat(appState.total_volume) || 0;
        }
        const printing_rate_m3_per_hour = 0.3;
        const total_printing_hours_needed = current_total_volume_calc / printing_rate_m3_per_hour;
        const currentMixDesign = MIX_DESIGNS[appState.selectedMixDesignIndex];
        const volume_per_batch_for_mixing = currentMixDesign.composition.total_volume_per_batch_m3;
        const mixing_time_per_batch_hours = currentMixDesign.composition.mixing_time_per_batch_hours;
        const num_batches = current_total_volume_calc / volume_per_batch_for_mixing;
        const total_mixing_hours_needed = num_batches * mixing_time_per_batch_hours;
        let calculated_project_duration_days = 0;
        const printer_hours = parseFloat(appState.printer_operating_hours_per_day) || 0;
        const mixing_hours = parseFloat(appState.mixing_operating_hours_per_day) || 0;
        if (printer_hours > 0 || mixing_hours > 0) {
            const printing_days = printer_hours > 0 ? total_printing_hours_needed / printer_hours : Infinity;
            const mixing_days = mixing_hours > 0 ? total_mixing_hours_needed / mixing_hours : Infinity;
            calculated_project_duration_days = Math.max(printing_days, mixing_days);
        } else {
            calculated_project_duration_days = 0;
        }
        let printer_cost = 0;
        const rate = appState.selectedPrinterOption.rate;
        const unit = appState.selectedPrinterOption.unit;
        if (unit === "hour") printer_cost = rate * total_printing_hours_needed;
        else if (unit === "8-hour") printer_cost = rate * (total_printing_hours_needed / 8);
        else if (unit === "day") printer_cost = rate * (total_printing_hours_needed / 24);
        else if (unit === "month") printer_cost = rate * (total_printing_hours_needed / (30 * 24));
        else if (unit === "year" || unit === "one-time") printer_cost = rate;
        let equipment_total = appState.equipment.reduce((sum, item) => sum + (item.use ? (parseFloat(item.qty) || 0) * (parseFloat(item.rate_per_unit) || 0) : 0), 0);
        let materials_total = 0;
        const adjusted_total_volume = current_total_volume_calc * (1 + (parseFloat(appState.waste_percentage) || 0) / 100);
        const material_qty_summary = [];
        const calculatedMaterialsList = appState.materials.map(material => {
            const materialInMix = currentMixDesign.composition[material.id];
            let quantityPerM3 = 0;
            if (materialInMix) {
                if (materialInMix.kg !== undefined) quantityPerM3 = materialInMix.kg / volume_per_batch_for_mixing;
                else if (materialInMix.liter !== undefined) quantityPerM3 = materialInMix.liter / volume_per_batch_for_mixing;
                else if (materialInMix.unit !== undefined) quantityPerM3 = materialInMix.unit / volume_per_batch_for_mixing;
            }
            material.qty_per_m3 = quantityPerM3; // Update state
            const shouldBeUsed = material.use && (material.id.startsWith('custom_') || materialInMix);
            const calculatedCost = shouldBeUsed ? (material.id.startsWith('custom_') ? material.qty_per_m3 : quantityPerM3) * (parseFloat(material.price_per_unit) || 0) * adjusted_total_volume : 0;
            materials_total += calculatedCost;
            material_qty_summary.push({ name: material.name, qty_per_m3: shouldBeUsed ? quantityPerM3 : 0, total_quantity: shouldBeUsed ? quantityPerM3 * adjusted_total_volume : 0, unit: material.unit.split('/')[0] });
            return { ...material, calculatedCost, use: shouldBeUsed };
        });
        const all_materials_total_qty = material_qty_summary.reduce((sum, item) => sum + (item.unit !== 'Unit' ? item.total_quantity : 0), 0);
        let labor_total = 0;
        const calculatedLaborList = appState.labor.map(item => {
            let projectTotalCost = 0;
            if (item.use) {
                const hoursPerDay = (parseFloat(item.time_minutes_per_day) || 0) / 60;
                if (item.name === "Mixing Crew") projectTotalCost = (parseFloat(item.qty) || 0) * (parseFloat(item.rate_per_hour) || 0) * total_mixing_hours_needed;
                else if (item.name === "Printer Operator") projectTotalCost = (parseFloat(item.qty) || 0) * (parseFloat(item.rate_per_hour) || 0) * total_printing_hours_needed;
                else projectTotalCost = (parseFloat(item.qty) || 0) * hoursPerDay * (parseFloat(item.rate_per_hour) || 0) * calculated_project_duration_days;
                labor_total += projectTotalCost;
            }
            return { ...item, calculatedCost: projectTotalCost };
        });
        const rebar_summary = { totalWeight: 0, totalLength: 0, totalCost: 0, totalBars: 0, details: [], priceBreakdown: [] };
        if (appState.rebar_length_mm > 0 && appState.rebar_width_mm > 0 && appState.rebar_height_mm > 0 && appState.rebar_segments > 0) {
            const L = (parseFloat(appState.rebar_length_mm) || 0) / 1000;
            const segments = parseFloat(appState.rebar_segments) || 0;
            const longJoints = (segments - 1 > 0 ? (segments - 1) * L : 0);
            // ... (rest of rebar calculations)
        }
        const steel_structure_total = (parseFloat(appState.steel_usage_ton) || 0) * (parseFloat(appState.steel_price_per_ton_usd) || 0) * EXCHANGE_RATES_TO_IDR['USD'];
        let transport_total = appState.transportItems.reduce((sum, item) => sum + (item.use ? (parseFloat(item.qty) || 0) * (parseFloat(item.rate_per_unit) || 0) : 0), 0);
        const calculatedTransportList = appState.transportItems.map(item => ({ ...item, calculatedCost: item.use ? (parseFloat(item.qty) || 0) * (parseFloat(item.rate_per_unit) || 0) : 0 }));
        
        const grand_total_project = printer_cost + equipment_total + materials_total + labor_total + rebar_summary.totalCost + steel_structure_total + transport_total;
        const cost_per_cubic = current_total_volume_calc > 0 ? grand_total_project / current_total_volume_calc : 0;
        
        return { cost_per_cubic, printer_cost, equipment_total, materials_total, labor_total, rebar_total: rebar_summary.totalCost, steel_structure_total, transport_total, grand_total_project, total_printing_hours_needed, total_mixing_hours_needed, calculated_project_duration_days, rebar_summary, material_qty_summary, all_materials_total_qty, calculatedMaterialsList, calculatedEquipmentList, calculatedLaborList, calculatedTransportList, current_total_volume_calc };
    }

    // --- RENDER FUNCTIONS ---
    function render() {
        // Translate static text
        document.querySelectorAll('[id^="t-"]').forEach(el => {
            const key = el.id.substring(2);
            if (translations[appState.language][key]) {
                el.innerHTML = t(key);
            }
        });
        
        renderNavLinks();
        renderSection('project-parameters', renderProjectParameters);
        renderSection('rebar', renderRebar);
        renderSection('steel-structure', renderSteel);
        renderSection('transportation-costs', renderTransport);
        renderSection('project-visualization', renderVisualization);
        renderSection('printing-geometry', renderGeometry);
        renderSection('material-composition', renderComposition);
        renderSection('material-quantity', renderMaterialQuantity);
        renderSection('printer-selection', renderPrinterSelection);
        renderSection('raw-materials', renderRawMaterials);
        renderSection('equipment', renderEquipment);
        renderSection('labor', renderLabor);
        renderCostPerCubic();
        renderSection('cost-summary', renderSummary);
        renderActionButtons();
        renderSection('history', renderHistory);
        renderSection('support', renderSupport);
    }
    
    function renderNavLinks() {
        const container = document.getElementById('nav-links');
        container.innerHTML = `
            <a href="#project-parameters" class="p-2 mx-1 rounded-lg transition-colors text-white font-semibold hover:bg-white/10">${t('parameters')}</a>
            <a href="#rebar-container" class="p-2 mx-1 rounded-lg transition-colors text-white font-semibold hover:bg-white/10">${t('rebar')}</a>
            <a href="#steel-structure-container" class="p-2 mx-1 rounded-lg transition-colors text-white font-semibold hover:bg-white/10">${t('steel')}</a>
            <a href="#transportation-costs-container" class="p-2 mx-1 rounded-lg transition-colors text-white font-semibold hover:bg-white/10">${t('transport')}</a>
            <a href="#raw-materials-container" class="p-2 mx-1 rounded-lg transition-colors text-white font-semibold hover:bg-white/10">${t('materials')}</a>
            <a href="#equipment-container" class="p-2 mx-1 rounded-lg transition-colors text-white font-semibold hover:bg-white/10">${t('equipment')}</a>
            <a href="#labor-container" class="p-2 mx-1 rounded-lg transition-colors text-white font-semibold hover:bg-white/10">${t('labor')}</a>
            <a href="#cost-summary-container" class="p-2 mx-1 rounded-lg transition-colors text-white font-semibold hover:bg-white/10">${t('summary')}</a>
            <a href="#history-container" class="p-2 mx-1 rounded-lg transition-colors text-white font-semibold hover:bg-white/10">${t('history')}</a>
        `;
    }

    function renderSection(id, contentRenderer) {
        const container = document.getElementById(`${id}-container`);
        if (!container) return;
        container.innerHTML = `
            <div id="${id}" class="section-card">
                ${contentRenderer()}
            </div>
        `;
        attachToggleListener(id);
        attachInputListeners();
    }
    
    // Example: renderProjectParameters
    function renderProjectParameters() {
        const results = calculateAllValues(); // get latest calculation
        return `
            <div class="section-header bg-blue-500">
                <span>🏗️ ${t('parameters')}</span>
                <button data-section="project-parameters" class="toggle-button">${appState.sectionVisibility['project-parameters'] ? '−' : '+'}</button>
            </div>
            <div class="section-content ${appState.sectionVisibility['project-parameters'] ? '' : 'hidden'}">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div class="flex flex-col">
                        <label for="projectName" class="text-gray-700 font-medium mb-2">${t('projectName')}</label>
                        <input type="text" id="projectName" value="${appState.projectName}" class="p-3 border rounded-lg">
                    </div>
                     <div class="flex flex-col">
                        <label for="total_volume" class="text-gray-700 font-medium mb-2">${t('totalVolume')}</label>
                        <input type="number" id="total_volume" value="${appState.total_volume.toFixed(4)}" ${appState.calc_volume_from_lwh ? 'readonly' : ''} class="p-3 border rounded-lg ${appState.calc_volume_from_lwh ? 'bg-gray-200' : ''}">
                        <div class="mt-2">
                            <input type="checkbox" id="calc_volume_from_lwh" ${appState.calc_volume_from_lwh ? 'checked' : ''}>
                            <label for="calc_volume_from_lwh">${t('calculateVolume')}</label>
                        </div>
                    </div>
                     <div class="flex flex-col">
                        <label class="text-gray-700 font-medium mb-2">${t('projectDuration')}</label>
                        <div class="p-3 border rounded-lg bg-gray-200">${results.calculated_project_duration_days.toFixed(2)}</div>
                    </div>
                     </div>
                 <div class="alert bg-blue-100 border-t-4 border-blue-500 text-blue-700 px-4 py-3 rounded-b relative mt-4" role="alert">
                    <p><strong>ℹ️ ${t('note')}:</strong> ${t('noteVolumeDuration')}</p>
                 </div>
            </div>
        `;
    }

    function renderCostPerCubic(){
        const container = document.getElementById('cost-per-cubic-meter-container');
        const results = calculateAllValues();
        container.innerHTML = `
         <div class="bg-gradient-to-br from-emerald-500 to-green-600 text-white p-6 rounded-xl text-center shadow-lg my-6">
            <h2 class="text-3xl font-bold mb-2">💰 ${t('costPerCubicMeter')}</h2>
            <div class="text-5xl font-extrabold my-4">${formatCost(results.cost_per_cubic)}</div>
            <p class="text-lg">${t('totalProjectVolume')}: <span class="font-bold">${results.current_total_volume_calc.toFixed(2)}</span> m³</p>
         </div>
        `;
    }

    function renderSummary() {
        const results = calculateAllValues();
        const total = results.grand_total_project > 0 ? results.grand_total_project : 1;
        const rows = [
            { category: t('printer'), desc: `${appState.selectedPrinter.name} - ${appState.selectedPrinterOption.label}`, value: results.printer_cost },
            { category: t('equipment'), desc: t('additionalToolsEquipment'), value: results.equipment_total },
            { category: t('materials'), desc: t('concreteMixComponents'), value: results.materials_total },
            { category: t('labor'), desc: t('workersSupervision'), value: results.labor_total },
            { category: t('rebar'), desc: t('steelBarsAccessories'), value: results.rebar_total },
            { category: t('steel'), desc: t('additionalSteelElements'), value: results.steel_structure_total },
            { category: t('transport'), desc: t('vehicleRentalsForTransport'), value: results.transport_total },
        ];

        return `
             <div class="section-header bg-purple-600">
                <span>📊 ${t('summary')}</span>
                <button data-section="cost-summary" class="toggle-button">${appState.sectionVisibility['cost-summary'] ? '−' : '+'}</button>
            </div>
            <div class="section-content ${appState.sectionVisibility['cost-summary'] ? '' : 'hidden'}">
                <div class="overflow-x-auto rounded-lg border">
                    <table class="w-full text-sm">
                        <thead class="bg-purple-700 text-white">
                            <tr>
                                <th class="px-6 py-3 text-left">${t('description')}</th>
                                <th class="px-6 py-3 text-right">${t('totalProject')}</th>
                                <th class="px-6 py-3 text-right">%</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows.map(row => `
                                <tr class="border-b hover:bg-purple-50">
                                    <td class="px-6 py-4 font-medium">${row.category}</td>
                                    <td class="px-6 py-4 text-right font-semibold text-green-800">${formatCost(row.value)}</td>
                                    <td class="px-6 py-4 text-right">${((row.value / total) * 100).toFixed(1)}%</td>
                                </tr>
                            `).join('')}
                             <tr class="bg-purple-100 font-bold">
                                <td class="px-6 py-4">${t('totalProject')}</td>
                                <td class="px-6 py-4 text-right">${formatCost(results.grand_total_project)}</td>
                                <td class="px-6 py-4 text-right">100%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    function renderActionButtons() {
        const container = document.getElementById('action-buttons-container');
        container.innerHTML = `
            <button id="print-btn" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md">🖨️ ${t('printReport')}</button>
            <button id="export-btn" class="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-md">🖼️ ${t('exportToImage')}</button>
        `;
    }

    function renderHistory() {
        const historyItems = appState.history.map(item => `
            <tr class="border-b hover:bg-blue-50">
                <td class="px-6 py-4">${item.timestamp ? new Date(item.timestamp.toDate()).toLocaleString() : 'N/A'}</td>
                <td class="px-6 py-4">${item.projectName || t('untitledProject')}</td>
                <td class="px-6 py-4 text-right">${formatCost(item.grandTotalProject || 0)}</td>
                <td class="px-6 py-4">
                    <button data-id="${item.id}" class="view-history-btn bg-blue-500 text-white px-2 py-1 rounded-md text-xs"> ${t('details')}</button>
                </td>
            </tr>
        `).join('');

        return `
             <div class="section-header bg-blue-500">
                <span>📜 ${t('calculationHistory')}</span>
                 <button data-section="history" class="toggle-button">${appState.sectionVisibility['history'] ? '−' : '+'}</button>
            </div>
            <div class="section-content ${appState.sectionVisibility['history'] ? '' : 'hidden'}">
                <p>${t('yourUserId')}: <span class="font-bold text-blue-700 break-all">${appState.userId}</span></p>
                <div class="overflow-x-auto rounded-lg border mt-4">
                    <table class="w-full text-sm">
                         <thead class="bg-blue-600 text-white">
                            <tr>
                                <th class="px-6 py-3 text-left">${t('date')}</th>
                                <th class="px-6 py-3 text-left">${t('projectName')}</th>
                                <th class="px-6 py-3 text-right">${t('totalProjectCost')}</th>
                                <th class="px-6 py-3 text-left">${t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>${appState.history.length ? historyItems : `<tr><td colspan="4" class="text-center p-4">${t('noHistoryFound')}</td></tr>`}</tbody>
                    </table>
                </div>
                <div class="flex gap-4 mt-4">
                     <button id="save-calc-btn" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg">${t('saveCurrentCalculation')}</button>
                     <button id="clear-history-btn" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg">${t('clearAllHistory')}</button>
                </div>
            </div>
        `;
    }
    
    // ... Tambahkan fungsi render lainnya (renderRebar, renderSteel, dll)
    // dengan pola yang sama: return string HTML.

    // --- EVENT HANDLERS ---
    function attachToggleListener(sectionId) {
        const button = document.querySelector(`button[data-section="${sectionId}"]`);
        if (button) {
            button.addEventListener('click', () => {
                appState.sectionVisibility[sectionId] = !appState.sectionVisibility[sectionId];
                render(); // Re-render the whole app to reflect the change
            });
        }
    }
    
    function attachInputListeners() {
        // Generic handler for simple value inputs
        const handleInput = (e) => {
            const key = e.target.id;
            if (key in appState) {
                appState[key] = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
                render();
            }
        };

        // Attach listeners
        document.getElementById('projectName')?.addEventListener('input', handleInput);
        document.getElementById('total_volume')?.addEventListener('input', handleInput);
        document.getElementById('calc_volume_from_lwh')?.addEventListener('change', handleInput);
        
        // ... (Tambahkan listener untuk semua input lain di semua section)

        // Action buttons
        document.getElementById('print-btn')?.addEventListener('click', () => window.print());
        document.getElementById('export-btn')?.addEventListener('click', exportToImage);
        document.getElementById('save-calc-btn')?.addEventListener('click', saveCurrentCalculation);
        document.getElementById('clear-history-btn')?.addEventListener('click', confirmClearHistory);
    }
    
    async function exportToImage() {
        const container = document.getElementById('main-container');
        showMessageBox(t('generating'), 'info');
        try {
            const canvas = await html2canvas(container, { scale: 2, useCORS: true });
            const link = document.createElement('a');
            link.download = 'cost-report.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
             showMessageBox(t('reportExported'), 'info');
        } catch (error) {
            console.error(error);
            showMessageBox(t('failedToExportReport'), 'error');
        }
    }

    // --- FIREBASE FUNCTIONS ---
    async function saveCurrentCalculation() {
        if (!appState.isAuthReady) return showMessageBox(t('authenticationNotReady'), 'error');
        const results = calculateAllValues();
        const dataToSave = {
            projectName: appState.projectName || t('untitledProject'),
            grandTotalProject: results.grand_total_project,
            costPerCubic: results.cost_per_cubic,
            totalVolume: results.current_total_volume_calc,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            //... Anda bisa menyimpan detail lain jika perlu
        };
        try {
            await db.collection(`users/${appState.userId}/calculations`).add(dataToSave);
            showMessageBox(t('calculationSaved'), 'info');
        } catch (error) {
             showMessageBox(t('errorSavingHistory'), 'error');
        }
    }

    function loadHistory() {
        db.collection(`users/${appState.userId}/calculations`).orderBy('timestamp', 'desc').onSnapshot(snapshot => {
            appState.history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            render(); // Re-render to show history
        });
    }

    function confirmClearHistory() {
        const content = document.createElement('div');
        content.innerHTML = `
            <p>${t('clearHistoryMessage')}</p>
            <div class="flex justify-center gap-4 mt-4">
                <button id="confirm-clear" class="bg-red-500 text-white px-4 py-2 rounded">${t('yesClearAll')}</button>
                <button class="cancel-btn bg-gray-300 px-4 py-2 rounded">${t('cancel')}</button>
            </div>
        `;
        content.querySelector('#confirm-clear').onclick = async () => {
             const batch = db.batch();
             appState.history.forEach(item => {
                const docRef = db.collection(`users/${appState.userId}/calculations`).doc(item.id);
                batch.delete(docRef);
             });
             await batch.commit();
             document.getElementById('message-box-container').classList.add('hidden');
             showMessageBox(t('allHistoryCleared'), 'info');
        };
        showMessageBox(content, 'modal', t('confirmClearHistory'), true);
    }

    // --- INIT ---
    function init() {
        document.getElementById('language_selector').addEventListener('change', (e) => {
            appState.language = e.target.value;
            render();
        });

        auth.onAuthStateChanged(user => {
            if (user) {
                appState.userId = user.uid;
                appState.isAuthReady = true;
                loadHistory(); // load history once authenticated
            } else {
                auth.signInAnonymously().catch(console.error);
            }
            render(); // Render initially
        });
    }

    init();
});
