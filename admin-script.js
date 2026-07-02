<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel // TWOJ GNIOTEK</title>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;700&family=Plus+Jakarta+Sans:wght@600;800&display=swap" rel="stylesheet">
    
    <script src="https://unpkg.com/lucide@latest"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    
    <!-- Firebase Initialization -->
    <script type="module" src="firebase-init.js?v=4.1"></script>
    
    <link rel="stylesheet" href="style.css?v=4.1">
    <style>
        body {
            padding-top: 80px;
        }
        
        .admin-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 40px 20px;
            position: relative;
            z-index: 10;
        }
        
        .admin-header {
            background: white;
            padding: 30px;
            border-radius: 24px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        
        .admin-tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
            flex-wrap: wrap;
        }
        
        .admin-tab {
            padding: 12px 24px;
            background: white;
            border: 2px solid rgba(0,0,0,0.1);
            border-radius: 12px;
            cursor: pointer;
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-weight: 600;
            transition: all 0.3s;
        }
        
        .admin-tab.active {
            background: var(--pink-jelly-deep);
            color: white;
            border-color: var(--pink-jelly-deep);
        }
        
        .admin-section {
            display: none;
        }
        
        .admin-section.active {
            display: block;
        }
        
        .orders-grid {
            display: grid;
            gap: 20px;
        }
        
        .order-card {
            background: white;
            padding: 25px;
            border-radius: 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        
        .order-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 2px solid rgba(0,0,0,0.05);
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .order-status-select {
            padding: 8px 16px;
            border-radius: 10px;
            border: 2px solid rgba(0,0,0,0.1);
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-weight: 600;
            cursor: pointer;
            min-width: 200px;
        }
        
        .status-nowy { background: #ffe8ec; color: #e91e63; }
        .status-potwierdzony { background: #e8f5e9; color: #4caf50; }
        .status-wtrakcie { background: #fff3e0; color: #ff9800; }
        .status-gotowy { background: #e3f2fd; color: #2196f3; }
        
        .order-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 15px;
        }
        
        .order-detail-item {
            padding: 10px;
            background: rgba(0,0,0,0.02);
            border-radius: 10px;
        }
        
        .order-detail-label {
            font-size: 0.8rem;
            color: var(--text-muted);
            margin-bottom: 5px;
        }
        
        .order-detail-value {
            font-weight: 600;
            color: var(--text-core);
            word-break: break-word;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        
        .stat-value {
            font-size: 2.5rem;
            font-weight: 800;
            color: var(--pink-jelly-deep);
            margin-bottom: 10px;
        }
        
        .stat-label {
            font-size: 0.9rem;
            color: var(--text-muted);
        }
        
        .users-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        
        .users-table th,
        .users-table td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        
        .users-table th {
            background: rgba(0,0,0,0.02);
            font-weight: 600;
        }
        
        .user-type-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .user-zalogowany { background: #e8f5e9; color: #4caf50; }
        .user-niezalogowany { background: #ffe8ec; color: #e91e63; }
        
        @media (max-width: 768px) {
            .admin-header {
                flex-direction: column;
                text-align: center;
                gap: 15px;
            }
            
            .admin-tabs {
                justify-content: center;
            }
            
            .admin-tab {
                padding: 10px 16px;
                font-size: 0.9rem;
            }
            
            .order-header {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .order-status-select {
                width: 100%;
            }
            
            .order-details {
                grid-template-columns: 1fr;
            }
            
            .stats-grid {
                grid-template-columns: 1fr;
            }
            
            .users-table {
                font-size: 0.85rem;
            }
            
            .users-table th,
            .users-table td {
                padding: 10px;
            }
        }
    </style>
</head>
<body class="jelly-universe">
    <div class="bg-overlay"></div>
    <div class="cinema-overlay-grain"></div>

    <header class="jelly-nav">
        <div class="jelly-container header-flex">
            <a href="index.html" class="brand-jelly-logo">TWOJ GNIOTEK<span>•</span></a>
            <a href="index.html" class="mega-nav-item">← Wróć do sklepu</a>
        </div>
    </header>

    <div class="admin-container">
        <div class="admin-header">
            <div>
                <h1 style="font-family: 'Fredoka', sans-serif; margin-bottom: 10px;">🔐 Panel Administratora</h1>
                <p style="color: var(--text-muted);">Zarządzanie zamówieniami i statystykami</p>
            </div>
            <button id="admin-logout" class="admin-tab" style="background: #ffe8ec; color: #e91e63;">
                Wyloguj
            </button>
        </div>

        <div class="admin-tabs">
            <button class="admin-tab active" data-tab="orders">📦 Zamówienia</button>
            <button class="admin-tab" data-tab="stats">📊 Statystyki</button>
            <button class="admin-tab" data-tab="users">👥 Użytkownicy</button>
        </div>

        <!-- Orders Section -->
        <div id="orders-section" class="admin-section active">
            <div style="margin-bottom: 20px;">
                <h2 style="font-family: 'Fredoka', sans-serif; margin-bottom: 15px;">Wszystkie zamówienia</h2>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button class="admin-tab" data-filter="all">Wszystkie</button>
                    <button class="admin-tab" data-filter="zalogowany">Zalogowani</button>
                    <button class="admin-tab" data-filter="niezalogowany">Niezalogowani</button>
                </div>
            </div>
            <div id="orders-container" class="orders-grid">
                <p style="text-align: center; color: var(--text-muted);">Ładowanie zamówień...</p>
            </div>
        </div>

        <!-- Stats Section -->
        <div id="stats-section" class="admin-section">
            <h2 style="font-family: 'Fredoka', sans-serif; margin-bottom: 20px;">📊 Statystyki</h2>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value" id="total-orders">0</div>
                    <div class="stat-label">Wszystkie zamówienia</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="total-revenue">0 PLN</div>
                    <div class="stat-label">Całkowity przychód</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="total-users">0</div>
                    <div class="stat-label">Zarejestrowani użytkownicy</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="total-squishes">0</div>
                    <div class="stat-label">Wszystkie ścisknięcia</div>
                </div>
            </div>

            <h3 style="font-family: 'Fredoka', sans-serif; margin-bottom: 15px;">🎮 Statystyki mini-gry</h3>
            <div id="mini-game-stats" class="orders-grid">
                <p style="text-align: center; color: var(--text-muted);">Ładowanie statystyk...</p>
            </div>
        </div>

        <!-- Users Section -->
        <div id="users-section" class="admin-section">
            <h2 style="font-family: 'Fredoka', sans-serif; margin-bottom: 20px;">👥 Użytkownicy</h2>
            <table class="users-table">
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Typ</th>
                        <th>Ścisknięcia</th>
                        <th>Data rejestracji</th>
                    </tr>
                </thead>
                <tbody id="users-table-body">
                    <tr><td colspan="4" style="text-align: center;">Ładowanie użytkowników...</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <script type="module" src="admin-script.js?v=4.1"></script>
</body>
</html>
