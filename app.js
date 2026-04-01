        // --- Tab Switching Logic ---
        function openTab(event, tabName) {
            let i, tabcontent, tabbuttons;
            tabcontent = document.getElementsByClassName("tab-content");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "none";
                tabcontent[i].classList.remove("active");
            }
            tabbuttons = document.getElementsByClassName("tab-button");
            for (i = 0; i < tabbuttons.length; i++) {
                tabbuttons[i].classList.remove("active");
            }
            document.getElementById(tabName).style.display = "block";
            document.getElementById(tabName).classList.add("active");
            event.currentTarget.classList.add("active");
        }
        document.addEventListener('DOMContentLoaded', () => { document.querySelector('.tab-button').click(); });

        // --- Global Variables ---
        let parsedMatches = [], parsedBracketMatches = [], teamEloRatings = {}, allTeams = new Set(), groupedMatches = {}, groupTeamNames = {}, simulationAggStats = {}, currentNumSims = 0;

        // --- DOM Elements ---
        const matchDataEl = document.getElementById('matchData'), numSimulationsEl = document.getElementById('numSimulations');
        const parseButtonEl = document.getElementById('parseButton'), runButtonEl = document.getElementById('runButton'), clearButtonEl = document.getElementById('clearButton');
        const statusAreaEl = document.getElementById('statusArea'), loaderEl = document.getElementById('loader'), resultsContentEl = document.getElementById('resultsContent');
        const csvFileInputEl = document.getElementById('csvFileInput'), csvFileNameEl = document.getElementById('csvFileName');
        const eloCsvFileInputEl = document.getElementById('eloCsvFileInput'), eloCsvFileNameEl = document.getElementById('eloCsvFileName');
        const eloDataEl = document.getElementById('eloData'), inputModeEl = document.getElementById('inputMode');
        const bracketCsvFileInputEl = document.getElementById('bracketCsvFileInput'), bracketCsvFileNameEl = document.getElementById('bracketCsvFileName');
        const bracketDataEl = document.getElementById('bracketData');
        const simGroupSelectEl = document.getElementById('simGroupSelect'), simBookieMarginEl = document.getElementById('simBookieMargin');
        const showSimulatedOddsButtonEl = document.getElementById('showSimulatedOddsButton');
        const calculatedOddsResultContentEl = document.getElementById('calculatedOddsResultContent'), simulatedOddsStatusEl = document.getElementById('simulatedOddsStatus');
        const simTeamSelectEl = document.getElementById('simTeamSelect');
        const customProbInputsContainerEl = document.getElementById('customProbInputsContainer');
        const simCustomStatTypeEl = document.getElementById('simCustomStatType'), simCustomOperatorEl = document.getElementById('simCustomOperator');
        const simCustomValue1El = document.getElementById('simCustomValue1'), simCustomValue2El = document.getElementById('simCustomValue2');
        const calculateCustomProbAndOddButtonEl = document.getElementById('calculateCustomProbAndOddButton');
        const customProbAndOddResultAreaEl = document.getElementById('customProbAndOddResultArea');
        const generateTeamCsvButtonEl = document.getElementById('generateTeamCsvButton'); 
        const generateGroupCsvButtonEl = document.getElementById('generateGroupCsvButton');
        const tieBreakPresetEl = document.getElementById('tieBreakPreset');
        const tieBreakPresetHelpEl = document.getElementById('tieBreakPresetHelp');
        const advancementPresetEl = document.getElementById('advancementPreset');
        const advancementPresetHelpEl = document.getElementById('advancementPresetHelp');
        const tournamentTeamSelectEl = document.getElementById('tournamentTeamSelect');
        const tournamentBookieMarginEl = document.getElementById('tournamentBookieMargin');
        const showTournamentTeamOddsButtonEl = document.getElementById('showTournamentTeamOddsButton');
        const tournamentTeamOddsStatusEl = document.getElementById('tournamentTeamOddsStatus');
        const tournamentTeamOddsResultContentEl = document.getElementById('tournamentTeamOddsResultContent');

        const tieBreakRulePresets = {
            uefa_competition: {
                label: "UEFA-style (H2H before overall GD)",
                description: "Pts → H2H Pts → H2H GD → H2H GF → GD → GF → Wins → Team name",
                criteriaAfterPoints: ['h2hPts', 'h2hGd', 'h2hGf', 'gd', 'gf', 'wins', 'name']
            },
            fifa_competition: {
                label: "FIFA-style (GD before H2H)",
                description: "Pts → GD → GF → H2H Pts → H2H GD → H2H GF → Wins → Team name",
                criteriaAfterPoints: ['gd', 'gf', 'h2hPts', 'h2hGd', 'h2hGf', 'wins', 'name']
            },
            domestic_standard: {
                label: "League standard (Pts/GD/GF)",
                description: "Pts → GD → GF → Wins → Team name",
                criteriaAfterPoints: ['gd', 'gf', 'wins', 'name']
            },
            head_to_head_first: {
                label: "Head-to-head first",
                description: "Pts → H2H Pts → H2H GD → H2H GF → GD → GF → Team name",
                criteriaAfterPoints: ['h2hPts', 'h2hGd', 'h2hGf', 'gd', 'gf', 'name']
            },
            goals_scored_priority: {
                label: "Goals-scored priority",
                description: "Pts → GF → GD → Wins → Team name",
                criteriaAfterPoints: ['gf', 'gd', 'wins', 'name']
            }
        };

        const advancementRulePresets = {
            top2_only: {
                label: "Top 2 only",
                description: "Top 2 teams per group qualify. No best-third ranking is used.",
                autoQualifiersPerGroup: 2,
                bestThirdSlots: 0
            },
            top2_plus_best4_thirds: {
                label: "Top 2 + best 4 third-placed",
                description: "Top 2 qualify directly, plus 4 best 3rd-placed teams across groups.",
                autoQualifiersPerGroup: 2,
                bestThirdSlots: 4
            },
            top2_plus_best8_thirds: {
                label: "Top 2 + best 8 third-placed",
                description: "Top 2 qualify directly, plus 8 best 3rd-placed teams across groups.",
                autoQualifiersPerGroup: 2,
                bestThirdSlots: 8
            }
        };

        function populateTieBreakPresets() {
            tieBreakPresetEl.innerHTML = '';
            Object.entries(tieBreakRulePresets).forEach(([key, preset]) => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = preset.label;
                tieBreakPresetEl.appendChild(option);
            });
            tieBreakPresetEl.value = 'uefa_competition';
            updateTieBreakPresetDescription();
        }

        function updateTieBreakPresetDescription() {
            const preset = tieBreakRulePresets[tieBreakPresetEl.value];
            tieBreakPresetHelpEl.textContent = preset ? preset.description : '';
        }
        tieBreakPresetEl.addEventListener('change', updateTieBreakPresetDescription);

        function populateAdvancementPresets() {
            advancementPresetEl.innerHTML = '';
            Object.entries(advancementRulePresets).forEach(([key, preset]) => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = preset.label;
                advancementPresetEl.appendChild(option);
            });
            advancementPresetEl.value = 'top2_plus_best8_thirds';
            updateAdvancementPresetDescription();
        }

        function updateAdvancementPresetDescription() {
            const preset = advancementRulePresets[advancementPresetEl.value];
            advancementPresetHelpEl.textContent = preset ? preset.description : '';
        }
        advancementPresetEl.addEventListener('change', updateAdvancementPresetDescription);

        function getSelectedAdvancementPreset() {
            return advancementRulePresets[advancementPresetEl.value] || advancementRulePresets.top2_plus_best8_thirds;
        }


        // --- CSV File Input ---
        csvFileInputEl.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                csvFileNameEl.textContent = file.name;
                const reader = new FileReader();
                reader.onload = (e) => { matchDataEl.value = e.target.result; statusAreaEl.innerHTML = `<p class="text-blue-500">CSV loaded. Click "Parse & Validate Data".</p>`; };
                reader.onerror = (e) => { statusAreaEl.innerHTML = `<p class="text-red-500">Error reading file: ${e.target.error.name}</p>`; csvFileNameEl.textContent = "No file selected."; };
                reader.readAsText(file);
            } else { csvFileNameEl.textContent = "No file selected."; }
        });

        eloCsvFileInputEl.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                eloCsvFileNameEl.textContent = file.name;
                const reader = new FileReader();
                reader.onload = (e) => { eloDataEl.value = e.target.result; statusAreaEl.innerHTML = `<p class="text-blue-500">Elo CSV loaded. Click "Parse & Validate Data".</p>`; };
                reader.onerror = (e) => { statusAreaEl.innerHTML = `<p class="text-red-500">Error reading Elo file: ${e.target.error.name}</p>`; eloCsvFileNameEl.textContent = "No file selected."; };
                reader.readAsText(file);
            } else { eloCsvFileNameEl.textContent = "No file selected."; }
        });

        bracketCsvFileInputEl.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                bracketCsvFileNameEl.textContent = file.name;
                const reader = new FileReader();
                reader.onload = (e) => { bracketDataEl.value = e.target.result; statusAreaEl.innerHTML = `<p class="text-blue-500">Bracket CSV loaded. Click "Parse & Validate Data".</p>`; };
                reader.onerror = (e) => { statusAreaEl.innerHTML = `<p class="text-red-500">Error reading bracket file: ${e.target.error.name}</p>`; bracketCsvFileNameEl.textContent = "No file selected."; };
                reader.readAsText(file);
            } else { bracketCsvFileNameEl.textContent = "No file selected."; }
        });

        function updateInputModeUi() {
            const mode = inputModeEl.value;
            const isEloMode = mode === 'elo';
            const isHybridMode = mode === 'hybrid';
            matchDataEl.disabled = isEloMode;
            csvFileInputEl.disabled = isEloMode;
            eloDataEl.disabled = mode === 'odds';
            eloCsvFileInputEl.disabled = mode === 'odds';
            parseButtonEl.textContent = isEloMode
                ? '1. Parse Elo & Build Fixtures'
                : (isHybridMode ? '1. Parse Hybrid Data' : '1. Parse & Validate Data');
        }
        inputModeEl.addEventListener('change', updateInputModeUi);
        
        // --- xG Calculation & Helpers ---
        function factorialJs(n) {
            if (n < 0) return NaN;
            if (n === 0) return 1;
            let result = 1;
            for (let i = 1; i <= n; i++) { result *= i; }
            return result;
        }

        function poissonPMF(mu, k) { 
            if (mu < 0 || k < 0 || !Number.isInteger(k)) return 0;
            if (mu === 0 && k === 0) return 1;
            if (mu === 0 && k > 0) return 0;
            const factK = factorialJs(k);
            if (factK === Infinity || factK === 0) return 0; 
            return (Math.pow(mu, k) * Math.exp(-mu)) / factK;
        }

        function poissonRandom(lambda) { 
            if (lambda <= 0) return 0;
            let L = Math.exp(-lambda);
            let k = 0;
            let p = 1;
            do {
                k++;
                p *= Math.random();
            } while (p > L);
            return k - 1;
        }
        
        function calculateModelProbsFromXG(homeXG, awayXG, goalLine = 2.5) {
            let probHomeWin = 0, probAwayWin = 0, probDraw = 0;
            let probUnder = 0, probOver = 0;
            const maxGoals = 20; 

            for (let i = 0; i <= maxGoals; i++) { 
                for (let j = 0; j <= maxGoals; j++) { 
                    const probScore = poissonPMF(homeXG, i) * poissonPMF(awayXG, j);
                    if (probScore === 0 && !(homeXG === 0 && i === 0 && awayXG === 0 && j === 0) ) continue; 

                    if (i > j) probHomeWin += probScore;
                    else if (j > i) probAwayWin += probScore;
                    else probDraw += probScore;

                    const totalMatchGoals = i + j;
                    if (totalMatchGoals < goalLine) probUnder += probScore;
                    else if (totalMatchGoals > goalLine) probOver += probScore;
                }
            }
            
            const modelProbHomeWinNoDraw = (probHomeWin + probAwayWin > 0) ? probHomeWin / (probHomeWin + probAwayWin) : 0.5; 
            const modelProbUnderNoExact = (probUnder + probOver > 0) ? probUnder / (probUnder + probOver) : 0.5; 
            
            return {
                modelProbHomeWinNoDraw: modelProbHomeWinNoDraw,
                modelProbUnderNoExact: modelProbUnderNoExact,
                probHomeWinFull: probHomeWin, probDrawFull: probDraw, probAwayWinFull: probAwayWin,
                probUnderFull: probUnder, probOverFull: probOver
            };
        }

        function calculateExpectedGoalsFromOdds(overPrice, underPrice, homePrice, awayPrice) {
            const normalisedUnder = (1 / underPrice) / ((1 / overPrice) + (1 / underPrice));
            const normalisedHomeNoDraw = (1 / homePrice) / ((1 / awayPrice) + (1 / homePrice));

            let totalGoals = 2.5; 
            let supremacy = 0;    

            let homeExpectedGoals, awayExpectedGoals;
            let increment;
            let error, previousError;
            let output;
            const maxIterations = 200; 
            const minStep = 0.001; 
            let iterations;

            const updateXGsForTotalGoals = () => {
                homeExpectedGoals = Math.max(0.01, totalGoals / 2 + supremacy / 2);
                awayExpectedGoals = Math.max(0.01, totalGoals / 2 - supremacy / 2);
            };
            
            updateXGsForTotalGoals(); 
            output = calculateModelProbsFromXG(homeExpectedGoals, awayExpectedGoals, 2.5);
            increment = (output.modelProbUnderNoExact > normalisedUnder) ? -0.05 : 0.05;


            error = Math.abs(output.modelProbUnderNoExact - normalisedUnder);
            previousError = error + 0.0001; 
            iterations = 0;

            while (error < previousError && iterations < maxIterations && Math.abs(increment) >= minStep) {
                totalGoals += increment;
                totalGoals = Math.max(0.02, totalGoals); 
                updateXGsForTotalGoals();
                
                output = calculateModelProbsFromXG(homeExpectedGoals, awayExpectedGoals, 2.5);
                previousError = error;
                error = Math.abs(output.modelProbUnderNoExact - normalisedUnder);
                
                if (error >= previousError) { 
                    totalGoals -= increment; 
                    increment /= 2; 
                    if(Math.abs(increment) < minStep) break; 
                    totalGoals += increment; 
                    updateXGsForTotalGoals();
                    output = calculateModelProbsFromXG(homeExpectedGoals, awayExpectedGoals, 2.5);
                    error = Math.abs(output.modelProbUnderNoExact - normalisedUnder); 
                }
                iterations++;
            }
             if (error >= previousError && iterations > 0) { 
                totalGoals -= increment; 
             }
             totalGoals = Math.max(0.02, totalGoals);
             updateXGsForTotalGoals();

            output = calculateModelProbsFromXG(homeExpectedGoals, awayExpectedGoals, 2.5); 
            increment = (output.modelProbHomeWinNoDraw > normalisedHomeNoDraw) ? -0.05 : 0.05;
            error = Math.abs(output.modelProbHomeWinNoDraw - normalisedHomeNoDraw);
            previousError = error + 0.0001; 
            iterations = 0;

            const updateXGsForSupremacy = () => {
                supremacy = Math.max(-(totalGoals - 0.02), Math.min(totalGoals - 0.02, supremacy));
                homeExpectedGoals = Math.max(0.01, totalGoals / 2 + supremacy / 2);
                awayExpectedGoals = Math.max(0.01, totalGoals / 2 - supremacy / 2);
            };
            updateXGsForSupremacy();


            while (error < previousError && iterations < maxIterations && Math.abs(increment) >= minStep) {
                supremacy += increment;
                updateXGsForSupremacy();
                
                output = calculateModelProbsFromXG(homeExpectedGoals, awayExpectedGoals, 2.5);
                previousError = error;
                error = Math.abs(output.modelProbHomeWinNoDraw - normalisedHomeNoDraw);

                if (error >= previousError) {
                    supremacy -= increment;
                    increment /= 2;
                    if(Math.abs(increment) < minStep) break;
                    supremacy += increment;
                    updateXGsForSupremacy();
                    output = calculateModelProbsFromXG(homeExpectedGoals, awayExpectedGoals, 2.5);
                    error = Math.abs(output.modelProbHomeWinNoDraw - normalisedHomeNoDraw);
                }
                iterations++;
            }
             if (error >= previousError && iterations > 0) {
                supremacy -= increment;
             }
             updateXGsForSupremacy();

            return { homeXG: homeExpectedGoals, awayXG: awayExpectedGoals };
        }

        function parseDelimitedLine(line, delimiter) {
            const fields = [];
            let current = '';
            let inQuotes = false;

            for (let i = 0; i < line.length; i++) {
                const char = line[i];

                if (char === '"') {
                    if (inQuotes && line[i + 1] === '"') {
                        current += '"';
                        i++;
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if (char === delimiter && !inQuotes) {
                    fields.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }

            fields.push(current.trim());
            return fields;
        }

        function getDelimitedParts(line) {
            if (line.includes('\t')) return parseDelimitedLine(line, '\t');
            if (line.includes(';')) return parseDelimitedLine(line, ';');
            if (line.includes(',')) return parseDelimitedLine(line, ',');
            return null;
        }

        function normalizePastedLineBreaks(raw) {
            return raw.replace(/\\r\\n|\\n|\\r/g, '\n');
        }

        function normalizeEscapedNewlines(raw) {
            return String(raw || '')
                .replace(/\\r\\n/g, '\n')
                .replace(/\\n/g, '\n')
                .replace(/\\r/g, '\n');
        }

        function isLikelyOddsHeader(parts) {
            const normalized = parts.map(p => String(p).trim().toUpperCase());
            return normalized.length >= 8
                && normalized[0] === 'GROUP'
                && normalized.includes('TEAM_A')
                && normalized.includes('TEAM_B')
                && normalized.includes('ODD1')
                && normalized.includes('ODDX')
                && normalized.includes('ODD2');
        }

        function getCsvExportDateTime() {
            const now = new Date();
            const date = `${now.getUTCDate()}.${now.getUTCMonth() + 1}.${now.getUTCFullYear()}`;
            const time = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`;
            return { date, time };
        }

        function clearOverUnderDisplay() {
            document.getElementById('ouTotalGroupGoalsResult').innerHTML = '';
            document.getElementById('expectedTotalGroupGoals').textContent = '';
            document.getElementById('ouFirstPlacePtsResult').innerHTML = '';
            document.getElementById('expectedFirstPlacePts').textContent = '';
            document.getElementById('ouFourthPlacePtsResult').innerHTML = '';
            document.getElementById('expectedFourthPlacePts').textContent = '';
            document.getElementById('ouFirstPlaceGFResult').innerHTML = '';
            document.getElementById('expectedFirstPlaceGF').textContent = '';
            document.getElementById('ouFourthPlaceGFResult').innerHTML = '';
            document.getElementById('expectedFourthPlaceGF').textContent = '';
        }

        function clamp(value, min, max) {
            return Math.max(min, Math.min(max, value));
        }

        function eloProbNoDraw(eloA, eloB) {
            const diff = eloA - eloB;
            return 1 / (1 + Math.pow(10, -diff / 400));
        }

        function deriveMatchFromElo(group, team1Name, team2Name, elo1, elo2, lineNum) {
            const diffAbs = Math.abs(elo1 - elo2);
            const p1NoDraw = eloProbNoDraw(elo1, elo2);
            const pDraw = clamp(0.20 + 0.11 * Math.exp(-diffAbs / 250), 0.18, 0.31);
            const p1 = (1 - pDraw) * p1NoDraw;
            const p2 = (1 - pDraw) * (1 - p1NoDraw);

            const totalGoals = 2.35 + Math.min(0.45, diffAbs / 900);
            const strength1 = p1 + 0.5 * pDraw;
            const strength2 = p2 + 0.5 * pDraw;
            const lambda1 = Math.max(0.05, totalGoals * (strength1 / (strength1 + strength2)));
            const lambda2 = Math.max(0.05, totalGoals * (strength2 / (strength1 + strength2)));

            return { lineNum, group, team1: team1Name, team2: team2Name, p1, px: pDraw, p2, lambda1, lambda2 };
        }

        function buildMatchPairKey(team1, team2) {
            return [team1, team2].sort((a, b) => a.localeCompare(b)).join('||');
        }

        function captureCurrentParsedState() {
            return {
                parsedMatches: parsedMatches.map(m => ({ ...m })),
                groupedMatches: Object.fromEntries(Object.entries(groupedMatches).map(([group, matches]) => [group, matches.map(m => ({ ...m }))])),
                groupTeamNames: Object.fromEntries(Object.entries(groupTeamNames).map(([group, teams]) => [group, [...teams]])),
                allTeams: new Set([...allTeams])
            };
        }

        function parseOddsInputData() {
            const data = normalizePastedLineBreaks(matchDataEl.value.trim());
            if (!data) return { errors: ['Error: Match data empty.'] };
            const lines = data.split(/\r?\n/);
            parsedMatches = [];
            allTeams.clear();
            groupedMatches = {};
            groupTeamNames = {};
            let errors = [], warnings = [];

            lines.forEach((line, index) => {
                line = line.trim(); if (!line || line.startsWith('#')) return;
                const delimitedParts = getDelimitedParts(line);
                const isCsvLike = Array.isArray(delimitedParts);
                let parts = isCsvLike ? delimitedParts : line.split(/\s+/).map(p => p.trim());
                parts = parts.filter(p => p.length > 0);
                if (index === 0 && isCsvLike && isLikelyOddsHeader(parts)) return;
                let group, team1Name, team2Name, oddsStrings;
                if (isCsvLike) {
                    const vsIdx = parts.indexOf('vs');
                    if (vsIdx !== -1) {
                        if (vsIdx > 0 && vsIdx < parts.length - 5) { group = parts[0]; team1Name = parts.slice(1, vsIdx).join(" "); team2Name = parts.slice(vsIdx + 1, parts.length - 5).join(" "); oddsStrings = parts.slice(parts.length - 5); if (!team1Name || !team2Name) { errors.push(`L${index+1}(CSV 'vs'): Empty T names. L:"${line}"`); return; }}
                        else { errors.push(`L${index+1}(CSV 'vs'): 'vs' wrong pos/few odds. L:"${line}"`); return; }
                    } else {
                        if (parts.length >= 8) { group = parts[0]; team1Name = parts[1]; team2Name = parts[2]; oddsStrings = parts.slice(3, 8); if (!team1Name || !team2Name) { errors.push(`L${index+1}(CSV no 'vs'): Empty T names. L:"${line}"`); return; }}
                        else { errors.push(`L${index+1}(CSV no 'vs'): <8 cols. Exp G,T1,T2,O1,OX,O2,OU_U,OU_O. Got ${parts.length}. L:"${line}"`); return; }
                    }
                } else {
                    const vsIdx = parts.indexOf('vs');
                    if (vsIdx > 0 && vsIdx < parts.length - 5) { group = parts[0]; team1Name = parts.slice(1, vsIdx).join(" "); team2Name = parts.slice(vsIdx + 1, parts.length - 5).join(" "); oddsStrings = parts.slice(parts.length - 5); if (!team1Name || !team2Name) { errors.push(`L${index+1}(Space): Empty T names. L:"${line}"`); return; }}
                    else { errors.push(`L${index+1}(Space): 'vs' issue/few odds. Exp G T1 vs T2 O1 OX O2 OU_U OU_O. L:"${line}"`); return; }
                }
                if (!oddsStrings || oddsStrings.length !== 5) { errors.push(`L${index+1}: Odds extract fail. Odds:${oddsStrings}. L:"${line}"`); return; }
                const odds = oddsStrings.map(parseFloat);
                if (odds.some(isNaN)) { errors.push(`L${index+1}: Invalid odds. Odds:"${oddsStrings.join(', ')}". L:"${line}"`); return; }
                if (odds.some(o => o <= 0)) { errors.push(`L${index+1}: Odds must be >0. Odds:"${oddsStrings.join(', ')}". L:"${line}"`); return; }

                const [o1, ox, o2, oUnder25, oOver25] = odds;
                const sumInv1X2 = (1/o1)+(1/ox)+(1/o2); if (sumInv1X2 === 0) { errors.push(`L${index+1}: Sum inv 1X2 odds 0. L:"${line}"`); return; }
                const p1_market=(1/o1)/sumInv1X2, px_market=(1/ox)/sumInv1X2, p2_market=(1/o2)/sumInv1X2;

                const xGResult = calculateExpectedGoalsFromOdds(oOver25, oUnder25, o1, o2);
                let lambda1 = xGResult.homeXG;
                let lambda2 = xGResult.awayXG;

                if (isNaN(lambda1) || isNaN(lambda2) || lambda1 <=0 || lambda2 <=0) {
                   warnings.push(`L${index+1}: xG calc fail/non-positive for ${team1Name}v${team2Name}. Defaulting. H=${lambda1?.toFixed(2)},A=${lambda2?.toFixed(2)}`);
                   const p_under_fb = (1/oUnder25) / ((1/oOver25) + (1/oUnder25));
                   const lt_fb_simple_approx = 2.5;
                   const s1_fb = p1_market + 0.5 * px_market;
                   const s2_fb = p2_market + 0.5 * px_market;
                   if(s1_fb + s2_fb > 0){
                       lambda1 = lt_fb_simple_approx * s1_fb / (s1_fb + s2_fb);
                       lambda2 = lt_fb_simple_approx * s2_fb / (s1_fb + s2_fb);
                   } else {
                       lambda1 = lt_fb_simple_approx / 2; lambda2 = lt_fb_simple_approx / 2;
                   }
                   lambda1 = Math.max(0.05, lambda1); lambda2 = Math.max(0.05, lambda2);
                }

                const match = { lineNum:index+1, group, team1:team1Name, team2:team2Name, p1: p1_market, px: px_market, p2: p2_market, lambda1, lambda2 };
                parsedMatches.push(match); allTeams.add(team1Name); allTeams.add(team2Name);
                if (!groupedMatches[group]) { groupedMatches[group]=[]; groupTeamNames[group]=new Set(); }
                groupedMatches[group].push(match); groupTeamNames[group].add(team1Name); groupTeamNames[group].add(team2Name);
            });

            for (const group in groupTeamNames) {
                if (groupTeamNames[group].size !== 4) warnings.push(`Gr ${group}: ${groupTeamNames[group].size} teams (exp 4).`);
                if (groupedMatches[group] && groupedMatches[group].length !== 6 && groupTeamNames[group].size === 4) warnings.push(`Gr ${group}: ${groupedMatches[group].length} matches (exp 6).`);
                groupTeamNames[group] = Array.from(groupTeamNames[group]);
            }

            return { errors, warnings };
        }

        function parseEloInputData() {
            const data = normalizeEscapedNewlines(eloDataEl.value).trim();
            if (!data) return { errors: ['Error: Elo data empty.'] };
            const lines = data.split('\n');
            parsedMatches = [];
            allTeams.clear();
            groupedMatches = {};
            groupTeamNames = {};
            const teamRatingsByGroup = {};
            let errors = [], warnings = [];

            lines.forEach((rawLine, index) => {
                const line = rawLine.trim();
                if (!line || line.startsWith('#')) return;
                const parts = getDelimitedParts(line) || line.split(/\s+/).map(p => p.trim());
                if (parts.length < 3) {
                    errors.push(`L${index+1}: Expected GROUP,TEAM,ELO. Got "${rawLine}"`);
                    return;
                }
                const group = (parts[0] || '').trim();
                const team = (parts[1] || '').trim();
                const elo = parseFloat(parts[2]);

                const maybeHeader = group.toLowerCase() === 'group' && team.toLowerCase() === 'team' && Number.isNaN(elo);
                if (maybeHeader) return;

                if (!group || !team || Number.isNaN(elo)) {
                    errors.push(`L${index+1}: Invalid GROUP/TEAM/ELO. Got "${rawLine}"`);
                    return;
                }
                if (!teamRatingsByGroup[group]) teamRatingsByGroup[group] = {};
                if (teamRatingsByGroup[group][team] !== undefined) {
                    warnings.push(`L${index+1}: Duplicate team ${team} in group ${group}. Last Elo value used.`);
                }
                teamRatingsByGroup[group][team] = elo;
            });

            Object.entries(teamRatingsByGroup).forEach(([group, teamMap]) => {
                const teams = Object.keys(teamMap);
                if (teams.length !== 4) warnings.push(`Gr ${group}: ${teams.length} teams (exp 4).`);
                groupTeamNames[group] = [...teams];
                groupedMatches[group] = [];
                teams.forEach(t => allTeams.add(t));

                for (let i = 0; i < teams.length; i++) {
                    for (let j = i + 1; j < teams.length; j++) {
                        const team1 = teams[i];
                        const team2 = teams[j];
                        const match = deriveMatchFromElo(group, team1, team2, teamMap[team1], teamMap[team2], parsedMatches.length + 1);
                        parsedMatches.push(match);
                        groupedMatches[group].push(match);
                    }
                }
                if (teams.length === 4 && groupedMatches[group].length !== 6) warnings.push(`Gr ${group}: ${groupedMatches[group].length} generated matches (exp 6).`);
            });

            return { errors, warnings };
        }

        function parseTeamEloRatingsData() {
            const data = normalizeEscapedNewlines(eloDataEl.value).trim();
            const errors = [];
            const warnings = [];
            const eloMap = {};
            if (!data) return { errors: ['Error: Elo data empty.'], warnings, eloMap };

            const lines = data.split('\n');
            lines.forEach((rawLine, index) => {
                const line = rawLine.trim();
                if (!line || line.startsWith('#')) return;
                const parts = getDelimitedParts(line) || line.split(/\s+/).map(p => p.trim());
                if (parts.length < 3) {
                    errors.push(`L${index+1}: Expected GROUP,TEAM,ELO. Got "${rawLine}"`);
                    return;
                }
                const group = (parts[0] || '').trim();
                const team = (parts[1] || '').trim();
                const elo = parseFloat(parts[2]);
                const maybeHeader = group.toLowerCase() === 'group' && team.toLowerCase() === 'team' && Number.isNaN(elo);
                if (maybeHeader) return;
                if (!team || Number.isNaN(elo)) {
                    errors.push(`L${index+1}: Invalid TEAM/ELO. Got "${rawLine}"`);
                    return;
                }
                if (eloMap[team] !== undefined) warnings.push(`L${index+1}: Duplicate Elo for ${team}. Last value used.`);
                eloMap[team] = elo;
            });

            return { errors, warnings, eloMap };
        }

        function getKnockoutLambdasFromElo(teamA, teamB) {
            const eloA = teamEloRatings[teamA] ?? 1500;
            const eloB = teamEloRatings[teamB] ?? 1500;
            const diffAbs = Math.abs(eloA - eloB);
            const pANoDraw = eloProbNoDraw(eloA, eloB);
            const pDraw = clamp(0.22 + 0.10 * Math.exp(-diffAbs / 260), 0.18, 0.33);
            const pA = (1 - pDraw) * pANoDraw;
            const pB = (1 - pDraw) * (1 - pANoDraw);
            const totalGoals = 2.25 + Math.min(0.35, diffAbs / 1000);
            const strengthA = pA + 0.5 * pDraw;
            const strengthB = pB + 0.5 * pDraw;
            return {
                lambdaA: Math.max(0.05, totalGoals * (strengthA / (strengthA + strengthB))),
                lambdaB: Math.max(0.05, totalGoals * (strengthB / (strengthA + strengthB))),
                eloA, eloB
            };
        }

        function simulateKnockoutMatch(teamA, teamB) {
            const { lambdaA, lambdaB, eloA, eloB } = getKnockoutLambdasFromElo(teamA, teamB);
            const gA90 = poissonRandom(lambdaA);
            const gB90 = poissonRandom(lambdaB);
            if (gA90 !== gB90) {
                return { winner: gA90 > gB90 ? teamA : teamB, loser: gA90 > gB90 ? teamB : teamA, goalsA: gA90, goalsB: gB90 };
            }
            const gAET = poissonRandom(lambdaA / 3);
            const gBET = poissonRandom(lambdaB / 3);
            const finalGoalsA = gA90 + gAET;
            const finalGoalsB = gB90 + gBET;
            if (gAET !== gBET) {
                return { winner: gAET > gBET ? teamA : teamB, loser: gAET > gBET ? teamB : teamA, goalsA: finalGoalsA, goalsB: finalGoalsB };
            }
            const penAProb = eloProbNoDraw(eloA, eloB);
            const aWinsPens = Math.random() < penAProb;
            return { winner: aWinsPens ? teamA : teamB, loser: aWinsPens ? teamB : teamA, goalsA: finalGoalsA, goalsB: finalGoalsB };
        }

        function parseHybridInputData() {
            const oddsResult = parseOddsInputData();
            const oddsState = captureCurrentParsedState();
            const eloResult = parseEloInputData();
            const eloState = captureCurrentParsedState();

            const errors = [
                ...oddsResult.errors.map(e => `[Odds] ${e}`),
                ...eloResult.errors.map(e => `[Elo] ${e}`)
            ];
            const warnings = [
                ...oddsResult.warnings.map(w => `[Odds] ${w}`),
                ...eloResult.warnings.map(w => `[Elo] ${w}`)
            ];

            if (errors.length > 0) {
                parsedMatches = [];
                allTeams = new Set();
                groupedMatches = {};
                groupTeamNames = {};
                return { errors, warnings };
            }

            parsedMatches = [];
            allTeams = new Set();
            groupedMatches = {};
            groupTeamNames = {};

            const groupKeys = new Set([...Object.keys(oddsState.groupedMatches), ...Object.keys(eloState.groupedMatches)]);
            [...groupKeys].forEach(group => {
                const oddsMatches = oddsState.groupedMatches[group] || [];
                const eloMatches = eloState.groupedMatches[group] || [];
                const teams = eloState.groupTeamNames[group] || oddsState.groupTeamNames[group] || [];
                const matchByPair = {};
                groupedMatches[group] = [];
                groupTeamNames[group] = [...teams];
                teams.forEach(t => allTeams.add(t));

                oddsMatches.forEach(m => {
                    const key = buildMatchPairKey(m.team1, m.team2);
                    if (matchByPair[key]) {
                        warnings.push(`[Hybrid] Duplicate odds pair in group ${group}: ${m.team1} vs ${m.team2}. Keeping first.`);
                        return;
                    }
                    matchByPair[key] = true;
                    groupedMatches[group].push({ ...m, lineNum: parsedMatches.length + 1 });
                    parsedMatches.push(groupedMatches[group][groupedMatches[group].length - 1]);
                    allTeams.add(m.team1); allTeams.add(m.team2);
                });

                eloMatches.forEach(m => {
                    const key = buildMatchPairKey(m.team1, m.team2);
                    if (matchByPair[key]) return;
                    matchByPair[key] = true;
                    groupedMatches[group].push({ ...m, lineNum: parsedMatches.length + 1 });
                    parsedMatches.push(groupedMatches[group][groupedMatches[group].length - 1]);
                    allTeams.add(m.team1); allTeams.add(m.team2);
                });

                if ((groupTeamNames[group] || []).length === 4 && groupedMatches[group].length !== 6) {
                    warnings.push(`[Hybrid] Gr ${group}: ${groupedMatches[group].length} matches after fill (exp 6).`);
                }
            });

            return { errors, warnings };
        }

        function isLikelyBracketHeader(parts) {
            const normalized = parts.map(p => String(p).trim().toUpperCase());
            return normalized.length >= 4
                && normalized[0] === 'ROUND'
                && normalized[1] === 'MATCH';
        }

        function parseBracketInputData() {
            const data = normalizePastedLineBreaks(bracketDataEl.value.trim());
            parsedBracketMatches = [];
            if (!data) return { errors: [], warnings: [] };

            const lines = data.split(/\r?\n/);
            const errors = [];
            const warnings = [];
            const allowedRounds = new Set(['R32', 'R16', 'QF', 'SF', '3RD', 'FINAL']);
            const seenMatchIds = new Set();

            lines.forEach((rawLine, index) => {
                const line = rawLine.trim();
                if (!line || line.startsWith('#')) return;

                const parts = (getDelimitedParts(line) || line.split(/\s+/).map(p => p.trim())).filter(Boolean);
                if (index === 0 && isLikelyBracketHeader(parts)) return;

                let round, matchIdRaw, sideA, sideB;
                const vsIdx = parts.indexOf('vs');
                if (vsIdx !== -1) {
                    if (parts.length < 5 || vsIdx < 2 || vsIdx >= parts.length - 1) {
                        errors.push(`Bracket L${index + 1}: Invalid 'vs' placement. Got "${rawLine}"`);
                        return;
                    }
                    round = parts[0];
                    matchIdRaw = parts[1];
                    sideA = parts.slice(2, vsIdx).join(' ');
                    sideB = parts.slice(vsIdx + 1).join(' ');
                } else {
                    if (parts.length < 4) {
                        errors.push(`Bracket L${index + 1}: Expected ROUND,MATCH,SIDE_A,SIDE_B (or with 'vs').`);
                        return;
                    }
                    round = parts[0];
                    matchIdRaw = parts[1];
                    sideA = parts[2];
                    sideB = parts.slice(3).join(' ');
                }

                if (!allowedRounds.has(String(round).toUpperCase())) warnings.push(`Bracket L${index + 1}: Unknown round "${round}".`);
                if (!sideA || !sideB) {
                    errors.push(`Bracket L${index + 1}: Empty side reference.`);
                    return;
                }

                const matchNum = parseInt(String(matchIdRaw).replace(/[^\d]/g, ''), 10);
                if (Number.isNaN(matchNum)) {
                    errors.push(`Bracket L${index + 1}: Could not parse match number from "${matchIdRaw}".`);
                    return;
                }
                if (seenMatchIds.has(matchNum)) warnings.push(`Bracket L${index + 1}: Duplicate match number ${matchNum}; keeping both entries.`);
                seenMatchIds.add(matchNum);

                parsedBracketMatches.push({
                    lineNum: index + 1,
                    round: String(round).toUpperCase(),
                    matchNum,
                    sideARef: sideA,
                    sideBRef: sideB
                });
            });

            return { errors, warnings };
        }


        // --- Parsing Logic (Simulator) ---
        parseButtonEl.addEventListener('click', () => {
            const mode = inputModeEl.value;
            const coreParsed = mode === 'elo'
                ? parseEloInputData()
                : (mode === 'hybrid' ? parseHybridInputData() : parseOddsInputData());
            const bracketParsed = parseBracketInputData();
            const shouldParseEloForKnockout = parsedBracketMatches.length > 0 || mode === 'elo' || mode === 'hybrid';
            const eloParsed = shouldParseEloForKnockout ? parseTeamEloRatingsData() : { errors: [], warnings: [], eloMap: {} };
            teamEloRatings = shouldParseEloForKnockout && eloParsed.errors.length === 0 ? eloParsed.eloMap : {};
            const errors = [...coreParsed.errors, ...bracketParsed.errors, ...eloParsed.errors.map(e => `[Elo] ${e}`)];
            const warnings = [...coreParsed.warnings, ...bracketParsed.warnings, ...eloParsed.warnings.map(w => `[Elo] ${w}`)];
            if (errors.length > 0) { statusAreaEl.innerHTML = `<p class="text-red-500 font-semibold">Parse Fail (${errors.length}):</p><ul class="list-disc list-inside text-red-500">${errors.map(e=>`<li>${e}</li>`).join('')}</ul>`; if (warnings.length > 0) statusAreaEl.innerHTML += `<p class="text-yellow-600 font-semibold mt-2">Warn (${warnings.length}):</p><ul class="list-disc list-inside text-yellow-600">${warnings.map(w=>`<li>${w}</li>`).join('')}</ul>`; runButtonEl.disabled = true; }
            else {
                const modeLabel = mode === 'elo' ? 'Elo-generated fixtures' : (mode === 'hybrid' ? 'hybrid (odds + Elo fill)' : 'odds input');
                statusAreaEl.innerHTML = `<p class="text-green-500">Parsed ${parsedMatches.length} matches, ${Object.keys(groupedMatches).length} gr, ${allTeams.size} teams (${modeLabel}).</p><p class="text-blue-600">Bracket rows loaded: ${parsedBracketMatches.length}. Elo ratings loaded: ${Object.keys(teamEloRatings).length} teams.</p>`;
                if (warnings.length > 0) statusAreaEl.innerHTML += `<p class="text-yellow-600 font-semibold mt-2">Warn (${warnings.length}):</p><ul class="list-disc list-inside text-yellow-600">${warnings.map(w=>`<li>${w}</li>`).join('')}</ul>`;
                runButtonEl.disabled = false;
                resultsContentEl.innerHTML = "Parsed. Ready for sim.";
            }
        });


        // --- Simulation Logic ---
        runButtonEl.addEventListener('click', () => {
            if (parsedMatches.length === 0) { statusAreaEl.innerHTML = '<p class="text-red-500">No data.</p>'; return; }
            currentNumSims = parseInt(numSimulationsEl.value); if (isNaN(currentNumSims) || currentNumSims <= 0) { statusAreaEl.innerHTML = '<p class="text-red-500">Sims > 0.</p>'; return; }
            loaderEl.classList.remove('hidden'); statusAreaEl.innerHTML = `<p class="text-blue-500">Running ${currentNumSims} sims...</p>`;
            resultsContentEl.innerHTML = ""; runButtonEl.disabled = true; parseButtonEl.disabled = true;
            
            setTimeout(() => {
                try {
                    simulationAggStats = runSimulation(currentNumSims);
                    try {
                        displayResults(simulationAggStats, currentNumSims);
                    } catch (displayError) {
                        console.error("DisplayResults Error:", displayError);
                        statusAreaEl.innerHTML += `<p class="text-red-500">Error displaying results: ${displayError.message}</p>`;
                    }
                    populateSimGroupSelect(); 
                    populateTournamentTeamSelect();
                    statusAreaEl.innerHTML = `<p class="text-green-500">Sim complete! (${currentNumSims} runs)</p>`;
                } catch (simError) { 
                    console.error("Sim Error:", simError);
                    statusAreaEl.innerHTML = `<p class="text-red-500">Error during simulation: ${simError.message}</p>`;
                    simulationAggStats = {}; 
                    populateSimGroupSelect(); 
                    populateTournamentTeamSelect();
                } finally {
                    loaderEl.classList.add('hidden');
                    runButtonEl.disabled = false;
                    parseButtonEl.disabled = false;
                }
            }, 50);
        });

        function initializeKnockoutStats(aggStats) {
            aggStats._knockout = { teamProgress: {} };
            Object.values(groupTeamNames).flat().forEach(team => {
                aggStats._knockout.teamProgress[team] = {
                    reachR32: 0, reachR16: 0, reachQF: 0, reachSF: 0, reachFINAL: 0, winFINAL: 0,
                    eliminateR32: 0, eliminateR16: 0, eliminateQF: 0, eliminateSF: 0,
                    runnerUpCount: 0, thirdPlaceCount: 0,
                    tournamentGfSims: [], tournamentGaSims: [], tournamentGamesSims: []
                };
            });
        }

        function incrementRoundReach(aggStats, team, round) {
            const teamStats = aggStats?._knockout?.teamProgress?.[team];
            if (!teamStats) return;
            if (round === 'R32') teamStats.reachR32++;
            if (round === 'R16') teamStats.reachR16++;
            if (round === 'QF') teamStats.reachQF++;
            if (round === 'SF') teamStats.reachSF++;
            if (round === 'FINAL') teamStats.reachFINAL++;
        }

        function resolveBracketReference(ref, groupStandings, thirdQualifiedByGroup, thirdRankedList, usedTeams, knockoutWinners, knockoutLosers) {
            const cleaned = String(ref || '').trim();
            const winnerGroupMatch = cleaned.match(/^Winner Group\s+([A-Za-z0-9]+)$/i);
            if (winnerGroupMatch) return groupStandings[winnerGroupMatch[1]]?.[0]?.name || null;
            const runnerUpGroupMatch = cleaned.match(/^Runner-up Group\s+([A-Za-z0-9]+)$/i);
            if (runnerUpGroupMatch) return groupStandings[runnerUpGroupMatch[1]]?.[1]?.name || null;
            const thirdGroupMatch = cleaned.match(/^3rd Group\s+(.+)$/i);
            if (thirdGroupMatch) {
                const groups = thirdGroupMatch[1].split('/').map(g => g.trim()).filter(Boolean);
                const pick = thirdRankedList.find(team => groups.includes(team.group) && thirdQualifiedByGroup.has(team.group) && !usedTeams.has(team.name));
                return pick?.name || null;
            }
            const winnerMatchRef = cleaned.match(/^Winner Match\s+(\d+)$/i);
            if (winnerMatchRef) return knockoutWinners[parseInt(winnerMatchRef[1], 10)] || null;
            const loserMatchRef = cleaned.match(/^Loser Match\s+(\d+)$/i);
            if (loserMatchRef) return knockoutLosers[parseInt(loserMatchRef[1], 10)] || null;
            return cleaned || null;
        }

        function runKnockoutStage(aggStats, groupStandings, thirdRankedList, simTournamentTotals) {
            if (!parsedBracketMatches.length) return;
            const sortedBracketMatches = [...parsedBracketMatches].sort((a, b) => a.matchNum - b.matchNum);
            const knockoutWinners = {};
            const knockoutLosers = {};
            const thirdQualifiedByGroup = new Set(thirdRankedList.map(t => t.group));
            const usedTeamsInRound = {};

            sortedBracketMatches.forEach(match => {
                usedTeamsInRound[match.round] = usedTeamsInRound[match.round] || new Set();
                const usedTeams = usedTeamsInRound[match.round];
                const teamA = resolveBracketReference(match.sideARef, groupStandings, thirdQualifiedByGroup, thirdRankedList, usedTeams, knockoutWinners, knockoutLosers);
                const teamB = resolveBracketReference(match.sideBRef, groupStandings, thirdQualifiedByGroup, thirdRankedList, usedTeams, knockoutWinners, knockoutLosers);
                if (!teamA || !teamB || teamA === teamB) return;

                usedTeams.add(teamA);
                usedTeams.add(teamB);
                incrementRoundReach(aggStats, teamA, match.round);
                incrementRoundReach(aggStats, teamB, match.round);

                const { winner, loser, goalsA, goalsB } = simulateKnockoutMatch(teamA, teamB);
                if (simTournamentTotals[teamA]) {
                    simTournamentTotals[teamA].gf += goalsA;
                    simTournamentTotals[teamA].ga += goalsB;
                    simTournamentTotals[teamA].games += 1;
                }
                if (simTournamentTotals[teamB]) {
                    simTournamentTotals[teamB].gf += goalsB;
                    simTournamentTotals[teamB].ga += goalsA;
                    simTournamentTotals[teamB].games += 1;
                }
                knockoutWinners[match.matchNum] = winner;
                knockoutLosers[match.matchNum] = loser;
                const loserStats = aggStats._knockout?.teamProgress?.[loser];
                if (loserStats) {
                    if (match.round === 'R32') loserStats.eliminateR32++;
                    if (match.round === 'R16') loserStats.eliminateR16++;
                    if (match.round === 'QF') loserStats.eliminateQF++;
                    if (match.round === 'SF') loserStats.eliminateSF++;
                    if (match.round === 'FINAL') loserStats.runnerUpCount++;
                }
                if (match.round === '3RD' && aggStats._knockout?.teamProgress?.[winner]) {
                    aggStats._knockout.teamProgress[winner].thirdPlaceCount++;
                }
                if (match.round === 'FINAL' && aggStats._knockout?.teamProgress?.[winner]) {
                    aggStats._knockout.teamProgress[winner].winFINAL++;
                }
            });
        }

        function runSimulation(numSims) {
            const aggStats={}; 
            const advancementPreset = getSelectedAdvancementPreset();
            const autoQualifiersPerGroup = Math.max(0, advancementPreset.autoQualifiersPerGroup || 0);
            const bestThirdSlots = Math.max(0, advancementPreset.bestThirdSlots || 0);
            for(const gr in groupedMatches){ 
                aggStats[gr]={
                    groupTotalGoalsSims:[], straightForecasts:{}, advancingDoubles:{}, 
                    anyTeam9PtsCount:0, anyTeam0PtsCount:0, 
                    firstPlacePtsSims:[], firstPlaceGFSims:[], 
                    fourthPlacePtsSims:[], fourthPlaceGFSims:[]
                }; 
                (groupTeamNames[gr]||[]).forEach(tN=>{
                    aggStats[gr][tN]={
                        posCounts:[0,0,0,0], ptsSims:[], gfSims:[], gaSims:[], winsSims: [],
                        mostGFCount:0, mostGACount:0,
                        autoQualifyCount: 0, bestThirdQualifyCount: 0, advanceToKnockoutCount: 0
                    };
                });
            }
            initializeKnockoutStats(aggStats);
            for(let i=0; i<numSims; i++){ 
                const simTournamentTotals = {};
                Object.keys(aggStats._knockout.teamProgress).forEach(team => {
                    simTournamentTotals[team] = { gf: 0, ga: 0, games: 0 };
                });
                const thirdPlacedTeams = [];
                const groupStandings = {};
                for(const gK in groupedMatches){ 
                    const cGMs=groupedMatches[gK];
                    const tIG=[...(groupTeamNames[gK]||[])]; 
                    if(tIG.length===0) continue; 
                    
                    const sTS={}; 
                    tIG.forEach(t=>sTS[t]={name:t,pts:0,gf:0,ga:0,gd:0, wins: 0}); 
                    let cGTG=0;
                    const simulatedGroupMatches = [];
            
                    cGMs.forEach(m=>{
                        const g1=poissonRandom(m.lambda1); 
                        const g2=poissonRandom(m.lambda2); 
                        simulatedGroupMatches.push({ team1: m.team1, team2: m.team2, g1, g2 });
                        if(sTS[m.team1]){sTS[m.team1].gf+=g1;sTS[m.team1].ga+=g2;} 
                        if(sTS[m.team2]){sTS[m.team2].gf+=g2;sTS[m.team2].ga+=g1;} 
                        cGTG+=(g1+g2); 
                        if(g1>g2){if(sTS[m.team1]){sTS[m.team1].pts+=3; sTS[m.team1].wins+=1;}}
                        else if(g2>g1){if(sTS[m.team2]){sTS[m.team2].pts+=3; sTS[m.team2].wins+=1;}}
                        else{if(sTS[m.team1])sTS[m.team1].pts+=1;if(sTS[m.team2])sTS[m.team2].pts+=1;}
                        if (simTournamentTotals[m.team1]) {
                            simTournamentTotals[m.team1].gf += g1;
                            simTournamentTotals[m.team1].ga += g2;
                            simTournamentTotals[m.team1].games += 1;
                        }
                        if (simTournamentTotals[m.team2]) {
                            simTournamentTotals[m.team2].gf += g2;
                            simTournamentTotals[m.team2].ga += g1;
                            simTournamentTotals[m.team2].games += 1;
                        }
                    });
            
                    if(aggStats[gK]) aggStats[gK].groupTotalGoalsSims.push(cGTG); 
                    const rTs = sortStandingsWithTieBreakers(
                        tIG.map(tN=>{const s=sTS[tN]||{name:tN,pts:0,gf:0,ga:0,gd:0, wins:0};s.gd=s.gf-s.ga;return s;}),
                        simulatedGroupMatches,
                        tieBreakRulePresets[tieBreakPresetEl.value] || tieBreakRulePresets.uefa_competition
                    );
                    groupStandings[gK] = rTs;
            
                    let mGF=-1,mGA=-1; 
                    let groupHad9Pts=false, groupHad0Pts=false; 
                    rTs.forEach(t=>{
                        mGF=Math.max(mGF,t.gf);
                        mGA=Math.max(mGA,t.ga); 
                        if(t.pts===9)groupHad9Pts=true; 
                        if(t.pts===0)groupHad0Pts=true;
                    }); 
                    if(groupHad9Pts&&aggStats[gK])aggStats[gK].anyTeam9PtsCount++; 
                    if(groupHad0Pts&&aggStats[gK])aggStats[gK].anyTeam0PtsCount++;
            
                    if(rTs.length>0&&aggStats[gK]){
                        aggStats[gK].firstPlacePtsSims.push(rTs[0].pts); 
                        aggStats[gK].firstPlaceGFSims.push(rTs[0].gf);
                    } 
                    if(rTs.length>=4&&aggStats[gK]){ 
                        aggStats[gK].fourthPlacePtsSims.push(rTs[3].pts); 
                        aggStats[gK].fourthPlaceGFSims.push(rTs[3].gf);
                    }
            
                    rTs.forEach((t,rI)=>{
                        const tA=aggStats[gK]?.[t.name]; 
                        if(tA){
                            if(rI<4)tA.posCounts[rI]++; 
                            tA.ptsSims.push(t.pts);
                            tA.winsSims.push(t.wins || 0);
                            tA.gfSims.push(t.gf);
                            tA.gaSims.push(t.ga); 
                            if(t.gf===mGF&&mGF>0)tA.mostGFCount++; 
                            if(t.ga===mGA&&mGA>0)tA.mostGACount++;
                            if (rI < autoQualifiersPerGroup) tA.autoQualifyCount++;
                            if (rI < autoQualifiersPerGroup) tA.advanceToKnockoutCount++;
                        }
                    });

                    if (rTs.length >= 3) {
                        thirdPlacedTeams.push({ group: gK, ...rTs[2] });
                    }
            
                    if(rTs.length>=2&&aggStats[gK]){
                        const sFK=`${rTs[0].name}(1st)-${rTs[1].name}(2nd)`;
                        aggStats[gK].straightForecasts[sFK]=(aggStats[gK].straightForecasts[sFK]||0)+1; 
                        const aDP=[rTs[0].name,rTs[1].name].sort();
                        const aDK=`${aDP[0]}&${aDP[1]}`;
                        aggStats[gK].advancingDoubles[aDK]=(aggStats[gK].advancingDoubles[aDK]||0)+1;
                    }
                }

                if (thirdPlacedTeams.length > 0) {
                    const sortedThirds = thirdPlacedTeams
                        .sort((a, b) => {
                            if (a.pts !== b.pts) return b.pts - a.pts;
                            if (a.gd !== b.gd) return b.gd - a.gd;
                            if (a.gf !== b.gf) return b.gf - a.gf;
                            if ((a.wins || 0) !== (b.wins || 0)) return (b.wins || 0) - (a.wins || 0);
                            if (a.group !== b.group) return a.group.localeCompare(b.group);
                            return a.name.localeCompare(b.name);
                        })
                    sortedThirds.slice(0, bestThirdSlots).forEach(team => {
                        const tA = aggStats[team.group]?.[team.name];
                        if (!tA) return;
                        tA.bestThirdQualifyCount++;
                        tA.advanceToKnockoutCount++;
                    });
                    if (Object.keys(teamEloRatings).length > 0 && parsedBracketMatches.length > 0) {
                        runKnockoutStage(aggStats, groupStandings, sortedThirds.slice(0, bestThirdSlots), simTournamentTotals);
                    }
                }
                Object.entries(aggStats._knockout.teamProgress).forEach(([team, stats]) => {
                    const simTotals = simTournamentTotals[team] || { gf: 0, ga: 0, games: 0 };
                    stats.tournamentGfSims.push(simTotals.gf);
                    stats.tournamentGaSims.push(simTotals.ga);
                    stats.tournamentGamesSims.push(simTotals.games);
                });
            }
            return aggStats;
        }

        function computeHeadToHeadStatsForTeams(teamNames, simulatedMatches) {
            const teamSet = new Set(teamNames);
            const h2hStats = {};
            teamNames.forEach(name => {
                h2hStats[name] = { h2hPts: 0, h2hGf: 0, h2hGa: 0, h2hGd: 0, h2hWins: 0 };
            });

            simulatedMatches.forEach(({ team1, team2, g1, g2 }) => {
                if (!teamSet.has(team1) || !teamSet.has(team2)) return;

                h2hStats[team1].h2hGf += g1;
                h2hStats[team1].h2hGa += g2;
                h2hStats[team2].h2hGf += g2;
                h2hStats[team2].h2hGa += g1;

                if (g1 > g2) {
                    h2hStats[team1].h2hPts += 3;
                    h2hStats[team1].h2hWins += 1;
                } else if (g2 > g1) {
                    h2hStats[team2].h2hPts += 3;
                    h2hStats[team2].h2hWins += 1;
                } else {
                    h2hStats[team1].h2hPts += 1;
                    h2hStats[team2].h2hPts += 1;
                }
            });

            teamNames.forEach(name => {
                h2hStats[name].h2hGd = h2hStats[name].h2hGf - h2hStats[name].h2hGa;
            });
            return h2hStats;
        }

        function compareTeamsByCriteria(teamA, teamB, criteria, h2hStats) {
            for (const criterion of criteria) {
                if (criterion === 'name') {
                    const byName = teamA.name.localeCompare(teamB.name);
                    if (byName !== 0) return byName;
                    continue;
                }

                const sourceA = criterion.startsWith('h2h') ? (h2hStats?.[teamA.name] || {}) : teamA;
                const sourceB = criterion.startsWith('h2h') ? (h2hStats?.[teamB.name] || {}) : teamB;
                const aVal = sourceA[criterion] || 0;
                const bVal = sourceB[criterion] || 0;
                if (aVal !== bVal) return bVal - aVal;
            }
            return teamA.name.localeCompare(teamB.name);
        }

        function sortStandingsWithTieBreakers(teams, simulatedMatches, selectedPreset) {
            const preset = selectedPreset || tieBreakRulePresets.uefa_competition;
            const criteriaAfterPoints = preset.criteriaAfterPoints || ['gd', 'gf', 'wins', 'name'];
            const sortedByPoints = [...teams].sort((a, b) => {
                if (a.pts !== b.pts) return b.pts - a.pts;
                return a.name.localeCompare(b.name);
            });

            const ranked = [];
            let idx = 0;
            while (idx < sortedByPoints.length) {
                const tiedSegment = [sortedByPoints[idx]];
                let nextIdx = idx + 1;
                while (nextIdx < sortedByPoints.length && sortedByPoints[nextIdx].pts === sortedByPoints[idx].pts) {
                    tiedSegment.push(sortedByPoints[nextIdx]);
                    nextIdx++;
                }

                if (tiedSegment.length > 1) {
                    const teamNames = tiedSegment.map(t => t.name);
                    const h2hStats = computeHeadToHeadStatsForTeams(teamNames, simulatedMatches);
                    tiedSegment.sort((a, b) => compareTeamsByCriteria(a, b, criteriaAfterPoints, h2hStats));
                }
                ranked.push(...tiedSegment);
                idx = nextIdx;
            }
            return ranked;
        }

        // --- Display Logic (Simulator) ---
        function displayResults(aggStats, numSims) {
            let html = ''; const sortedGroupKeys = Object.keys(aggStats).sort();
            for (const groupKey of sortedGroupKeys) {
                if (groupKey === '_knockout') continue;
                const groupData = aggStats[groupKey]; if (!groupData) continue;
                html += `<div class="mb-8 p-4 bg-white border border-gray-200 rounded-lg shadow"><h3 class="text-lg font-semibold text-indigo-600 mb-3">Group ${groupKey}</h3>`;
                html += `<h4 class="font-medium text-gray-700 mt-4 mb-1">Expected Team Stats:</h4><table class="min-w-full divide-y divide-gray-200 mb-3 text-xs sm:text-sm"><thead class="bg-gray-50"><tr>${['Team','E(Pts)','E(Wins)','E(GF)','E(GA)','P(Most GF)','P(Most GA)'].map(h=>`<th class="px-2 py-2 text-left font-medium text-gray-500 tracking-wider">${h}</th>`).join('')}</tr></thead><tbody class="bg-white divide-y divide-gray-200">`;
                (groupTeamNames[groupKey]||[]).forEach(teamName=>{const ts=groupData[teamName];if(!ts||!ts.ptsSims)return; const avgPts=(ts.ptsSims.length>0&&numSims>0)?ts.ptsSims.reduce((a,b)=>a+b,0)/numSims:0; const avgWins=(ts.winsSims&&ts.winsSims.length>0&&numSims>0)?ts.winsSims.reduce((a,b)=>a+b,0)/numSims:0; const avgGF=(ts.gfSims.length>0&&numSims>0)?ts.gfSims.reduce((a,b)=>a+b,0)/numSims:0; const avgGA=(ts.gaSims.length>0&&numSims>0)?ts.gaSims.reduce((a,b)=>a+b,0)/numSims:0; html+=`<tr><td class="px-2 py-2 whitespace-nowrap font-medium">${teamName}</td><td class="px-2 py-2">${avgPts.toFixed(2)}</td><td class="px-2 py-2">${avgWins.toFixed(2)}</td><td class="px-2 py-2">${avgGF.toFixed(2)}</td><td class="px-2 py-2">${avgGA.toFixed(2)}</td><td class="px-2 py-2">${(numSims>0?ts.mostGFCount/numSims*100:0).toFixed(1)}%</td><td class="px-2 py-2">${(numSims>0?ts.mostGACount/numSims*100:0).toFixed(1)}%</td></tr>`;});
                html += `</tbody></table>`;
                const avgGroupGoals = (groupData.groupTotalGoalsSims&&groupData.groupTotalGoalsSims.length>0&&numSims>0)?groupData.groupTotalGoalsSims.reduce((a,b)=>a+b,0)/numSims:0;
                html += `<p class="mt-2 text-sm"><strong>Expected Total Goals in Group ${groupKey}:</strong> ${avgGroupGoals.toFixed(2)}</p>`;
                const allSF=Object.entries(groupData.straightForecasts||{}).sort(([,a],[,b])=>b-a); html+=`<h4 class="font-medium text-gray-700 mt-4 mb-1">All Straight Forecasts (1st-2nd):</h4><ul class="list-disc list-inside text-sm max-h-40 overflow-y-auto">${allSF.map(([k,c])=>`<li>${k}: ${(numSims>0?c/numSims*100:0).toFixed(1)}%</li>`).join('')||'N/A'}</ul>`;
                const topAD=Object.entries(groupData.advancingDoubles||{}).sort(([,a],[,b])=>b-a).slice(0,10); html+=`<h4 class="font-medium text-gray-700 mt-4 mb-1">Top Advancing Doubles (Top 2 Any Order):</h4><ul class="list-disc list-inside text-sm">${topAD.map(([k,c])=>`<li>${k}: ${(numSims>0?c/numSims*100:0).toFixed(1)}%</li>`).join('')||'N/A'}</ul>`;
                html += `</div>`;
            }
            const knockoutTeams = Object.entries(aggStats?._knockout?.teamProgress || {});
            if (knockoutTeams.length > 0 && parsedBracketMatches.length > 0) {
                html += `<div class="mb-8 p-4 bg-white border border-gray-200 rounded-lg shadow"><h3 class="text-lg font-semibold text-rose-600 mb-3">Knockout Progression (Elo-driven)</h3>`;
                html += `<table class="min-w-full divide-y divide-gray-200 mb-3 text-xs sm:text-sm"><thead class="bg-gray-50"><tr><th class="px-2 py-2 text-left font-medium text-gray-500 tracking-wider">Team</th><th class="px-2 py-2 text-left font-medium text-gray-500 tracking-wider">R16</th><th class="px-2 py-2 text-left font-medium text-gray-500 tracking-wider">QF</th><th class="px-2 py-2 text-left font-medium text-gray-500 tracking-wider">SF</th><th class="px-2 py-2 text-left font-medium text-gray-500 tracking-wider">Final</th><th class="px-2 py-2 text-left font-medium text-gray-500 tracking-wider">Champion</th></tr></thead><tbody class="bg-white divide-y divide-gray-200">`;
                knockoutTeams
                    .sort(([a], [b]) => a.localeCompare(b))
                    .forEach(([team, stats]) => {
                        html += `<tr><td class="px-2 py-2 whitespace-nowrap font-medium">${team}</td><td class="px-2 py-2">${(stats.reachR16 / numSims * 100).toFixed(1)}%</td><td class="px-2 py-2">${(stats.reachQF / numSims * 100).toFixed(1)}%</td><td class="px-2 py-2">${(stats.reachSF / numSims * 100).toFixed(1)}%</td><td class="px-2 py-2">${(stats.reachFINAL / numSims * 100).toFixed(1)}%</td><td class="px-2 py-2 font-semibold">${(stats.winFINAL / numSims * 100).toFixed(1)}%</td></tr>`;
                    });
                html += `</tbody></table></div>`;
            }
            resultsContentEl.innerHTML = html || "<p>No results. Parse & run sim.</p>";
        }
        
        // --- Simulated Group Odds Tab Logic ---
        function calculateOddWithMargin(trueProb, marginDec) { if (trueProb <= 0) return "N/A"; const factor = 1 + marginDec; return (1 / (trueProb * factor)).toFixed(2); }
        
        function populateSimGroupSelect() {
            simGroupSelectEl.innerHTML = '<option value="">-- Select Group --</option>'; 
            simTeamSelectEl.innerHTML = '<option value="">-- Select Group First --</option>'; 
            simTeamSelectEl.disabled = true; 
            customProbInputsContainerEl.classList.add('hidden');
            if (Object.keys(simulationAggStats).length > 0) { 
                Object.keys(simulationAggStats).filter(groupKey => groupKey !== '_knockout').sort().forEach(groupKey => { 
                    const option = document.createElement('option'); 
                    option.value = groupKey; 
                    option.textContent = `Group ${groupKey}`; 
                    simGroupSelectEl.appendChild(option); 
                });
            } else { 
                 simGroupSelectEl.innerHTML = '<option value="">-- Run Sim First --</option>';
            }
        }

        function populateTournamentTeamSelect() {
            tournamentTeamSelectEl.innerHTML = '<option value="">-- Select Team --</option>';
            const knockoutTeams = Object.keys(simulationAggStats?._knockout?.teamProgress || {});
            const groupedTeams = Object.values(groupTeamNames || {}).flat();
            const teams = [...new Set([...knockoutTeams, ...groupedTeams])].sort((a, b) => a.localeCompare(b));
            if (!teams.length) {
                tournamentTeamSelectEl.innerHTML = '<option value="">-- Run Sim First --</option>';
                return;
            }
            teams.forEach(team => {
                const option = document.createElement('option');
                option.value = team;
                option.textContent = team;
                tournamentTeamSelectEl.appendChild(option);
            });
        }

        function renderOverUnderRows(values, lines, marginDecimal) {
            if (!values || values.length === 0 || currentNumSims === 0) return '<p class="text-xs text-gray-500">No data.</p>';
            let html = `<table class="odds-table text-xs sm:text-sm"><thead><tr><th>Line</th><th>Over</th><th>Under</th></tr></thead><tbody>`;
            lines.forEach(line => {
                const overProb = values.filter(v => v > line).length / currentNumSims;
                const underProb = values.filter(v => v < line).length / currentNumSims;
                html += `<tr><td>${line.toFixed(1)}</td><td>${calculateOddWithMargin(overProb, marginDecimal)}</td><td>${calculateOddWithMargin(underProb, marginDecimal)}</td></tr>`;
            });
            html += '</tbody></table>';
            return html;
        }

        simGroupSelectEl.addEventListener('change', () => {
            const selectedGroupKey = simGroupSelectEl.value;
            simTeamSelectEl.innerHTML = '<option value="">-- Select Team --</option>';
            customProbInputsContainerEl.classList.add('hidden'); 
            customProbAndOddResultAreaEl.innerHTML = "Custom prop odds will appear here...";

            if (selectedGroupKey && groupTeamNames[selectedGroupKey]) {
                generateGroupCsvButtonEl.disabled = false;
                groupTeamNames[selectedGroupKey].forEach(teamName => { 
                    const option = document.createElement('option'); 
                    option.value = teamName; 
                    option.textContent = teamName; 
                    simTeamSelectEl.appendChild(option); 
                });
                simTeamSelectEl.disabled = false;
            } else { 
                simTeamSelectEl.disabled = true;
                generateGroupCsvButtonEl.disabled = true;
            }
            clearOverUnderDisplay();
        });

        simTeamSelectEl.addEventListener('change', () => {
            if (simTeamSelectEl.value) {
                customProbInputsContainerEl.classList.remove('hidden');
                generateTeamCsvButtonEl.disabled = false;
                customProbAndOddResultAreaEl.innerHTML = "Define prop and click 'Calc Prop Odd'.";
            } else {
                customProbInputsContainerEl.classList.add('hidden');
                generateTeamCsvButtonEl.disabled = true;
            }
        });
        
        showSimulatedOddsButtonEl.addEventListener('click', () => { 
            const selectedGroupKey = simGroupSelectEl.value;
            const mainMarginPercent = parseFloat(simBookieMarginEl.value);
            const advancementPreset = getSelectedAdvancementPreset();
            
            simulatedOddsStatusEl.textContent = ""; 
            calculatedOddsResultContentEl.innerHTML = "";

            if (!selectedGroupKey) { simulatedOddsStatusEl.textContent = "Select group."; return; }
            if (isNaN(mainMarginPercent) || mainMarginPercent < 0 ) { 
                simulatedOddsStatusEl.textContent = "Please enter a valid non-negative margin."; 
                return; 
            }
            if (Object.keys(simulationAggStats).length === 0 || !simulationAggStats[selectedGroupKey] || currentNumSims === 0) { simulatedOddsStatusEl.textContent = "No sim data. Run sim."; return; }
            
            const groupData = simulationAggStats[selectedGroupKey], teams = groupTeamNames[selectedGroupKey] || [];
            if (!groupData || teams.length === 0) { simulatedOddsStatusEl.textContent = "Group data incomplete."; return; }
            
            const mainMarginDecimal = mainMarginPercent / 100;
            let html = `<h3 class="text-lg font-semibold text-purple-600 mb-2">Market Odds for Group ${selectedGroupKey} (Margin: ${mainMarginPercent}%)</h3>`;
            
            html += `<h4 class="font-medium text-gray-700 mt-3 mb-1">Team Standings Odds (1st/2nd/3rd/4th):</h4><table class="odds-table text-xs sm:text-sm"><thead><tr><th>Team</th><th>1st Place</th><th>2nd Place</th><th>3rd Place</th><th>4th Place</th></tr></thead><tbody>`;
            teams.forEach(tN=>{
                html += `<tr><td class="font-medium">${tN}</td>`;
                for(let i = 0; i < 4; i++) {
                    const tS=groupData[tN],tP=(tS&&tS.posCounts&&currentNumSims>0)?(tS.posCounts[i]||0)/currentNumSims:0,o=calculateOddWithMargin(tP,mainMarginDecimal);
                    html += `<td>${o} <span class="text-gray-400">(${(tP*100).toFixed(1)}%)</span></td>`;
                }
                html += `</tr>`;
            });
            html+=`</tbody></table>`;

            const winnerSelections = teams.map(teamName => {
                const teamStats = groupData[teamName];
                const winnerProbability = (teamStats && teamStats.posCounts && currentNumSims > 0)
                    ? (teamStats.posCounts[0] || 0) / currentNumSims
                    : 0;
                const winnerOdd = calculateOddWithMargin(winnerProbability, mainMarginDecimal);
                const impliedProbability = winnerOdd === "N/A" ? 0 : 1 / Number(winnerOdd);
                return { teamName, winnerProbability, winnerOdd, impliedProbability };
            });
            const totalWinnerImpliedProbability = winnerSelections.reduce((sum, selection) => sum + selection.impliedProbability, 0);
            const totalWinnerMarginPercent = (totalWinnerImpliedProbability - 1) * 100;

            html += `<h4 class="font-medium text-gray-700 mt-3 mb-1">Group Winner Odds (All Selections):</h4>`;
            html += `<table class="odds-table text-xs sm:text-sm"><thead><tr><th>Selection</th><th>Prob</th><th>Odd</th></tr></thead><tbody>`;
            winnerSelections.forEach(({ teamName, winnerProbability, winnerOdd }) => {
                html += `<tr><td>${teamName}</td><td>${(winnerProbability * 100).toFixed(1)}%</td><td>${winnerOdd}</td></tr>`;
            });
            html += `</tbody></table>`;
            html += `<p class="text-xs text-gray-600 -mt-2 mb-2"><strong>Total winner market margin:</strong> ${totalWinnerMarginPercent.toFixed(2)}% (sum implied probability: ${(totalWinnerImpliedProbability * 100).toFixed(2)}%).</p>`;
            
            html += `<h4 class="font-medium text-gray-700 mt-3 mb-1">To Qualify (${advancementPreset.label}):</h4><table class="odds-table text-xs sm:text-sm"><thead><tr><th>Team</th><th>P(Qualify)</th><th>Odd</th></tr></thead><tbody>`;
            teams.forEach(tN=>{const tS=groupData[tN],tP=(tS&&currentNumSims>0)?(tS.advanceToKnockoutCount||0)/currentNumSims:0,o=calculateOddWithMargin(tP,mainMarginDecimal);html+=`<tr><td>${tN}</td><td>${(tP*100).toFixed(1)}%</td><td>${o}</td></tr>`;});html+=`</tbody></table>`;

            html += `<h4 class="font-medium text-gray-700 mt-3 mb-1">Team to Score Most Goals:</h4><table class="odds-table text-xs sm:text-sm"><thead><tr><th>Team</th><th>P(Most GF)</th><th>Odd</th></tr></thead><tbody>`;
            teams.forEach(tN=>{const tS=groupData[tN],tP=(tS&&currentNumSims>0)?(tS.mostGFCount||0)/currentNumSims:0,o=calculateOddWithMargin(tP,mainMarginDecimal);html+=`<tr><td>${tN}</td><td>${(tP*100).toFixed(1)}%</td><td>${o}</td></tr>`;});html+=`</tbody></table>`;
            
            html += `<h4 class="font-medium text-gray-700 mt-3 mb-1">Team to Concede Most Goals:</h4><table class="odds-table text-xs sm:text-sm"><thead><tr><th>Team</th><th>P(Most GA)</th><th>Odd</th></tr></thead><tbody>`;
            teams.forEach(tN=>{const tS=groupData[tN],tP=(tS&&currentNumSims>0)?(tS.mostGACount||0)/currentNumSims:0,o=calculateOddWithMargin(tP,mainMarginDecimal);html+=`<tr><td>${tN}</td><td>${(tP*100).toFixed(1)}%</td><td>${o}</td></tr>`;});html+=`</tbody></table>`;

            const allSF = Object.entries(groupData.straightForecasts || {}).sort(([, a], [, b]) => b - a);
            html += `<h4 class="font-medium text-gray-700 mt-3 mb-1">All Straight Forecasts (1st-2nd):</h4>`;
            if (allSF.length > 0) {
                html += `<table class="odds-table text-xs sm:text-sm max-h-60 overflow-y-auto block"><thead><tr><th>Forecast</th><th>Prob</th><th>Odd</th></tr></thead><tbody>`;
                allSF.forEach(([k, c]) => { const tP = currentNumSims > 0 ? c / currentNumSims : 0, o = calculateOddWithMargin(tP, mainMarginDecimal); html += `<tr><td>${k}</td><td>${(tP * 100).toFixed(1)}%</td><td>${o}</td></tr>`; });
                html += `</tbody></table>`;
            } else { html += `<p class="text-xs text-gray-500">No SF data.</p>`; }

            const topAD=Object.entries(groupData.advancingDoubles||{}).sort(([,a],[,b])=>b-a).slice(0,10); html+=`<h4 class="font-medium text-gray-700 mt-3 mb-1">Top Advancing Doubles (Top 2 Any Order):</h4>`; if(topAD.length>0){html+=`<table class="odds-table text-xs sm:text-sm"><thead><tr><th>Pair</th><th>Prob</th><th>Odd</th></tr></thead><tbody>`;topAD.forEach(([k,c])=>{const tP=currentNumSims>0?c/currentNumSims:0,o=calculateOddWithMargin(tP,mainMarginDecimal);html+=`<tr><td>${k}</td><td>${(tP*100).toFixed(1)}%</td><td>${o}</td></tr>`;});html+=`</tbody></table>`;}else{html+=`<p class="text-xs text-gray-500">No AD data.</p>`;}
            
            const probAny9Pts = currentNumSims > 0 ? (groupData.anyTeam9PtsCount || 0) / currentNumSims : 0; const oddAny9Pts = calculateOddWithMargin(probAny9Pts, mainMarginDecimal);
            html += `<h4 class="font-medium text-gray-700 mt-3 mb-1">Group Specials:</h4><table class="odds-table text-xs sm:text-sm"><thead><tr><th>Event</th><th>Prob</th><th>Odd</th></tr></thead><tbody>`;
            html += `<tr><td>Any Team scores 9 Pts</td><td>${(probAny9Pts * 100).toFixed(1)}%</td><td>${oddAny9Pts}</td></tr>`;
            const probAny0Pts = currentNumSims > 0 ? (groupData.anyTeam0PtsCount || 0) / currentNumSims : 0; const oddAny0Pts = calculateOddWithMargin(probAny0Pts, mainMarginDecimal);
            html += `<tr><td>Any Team scores 0 Pts</td><td>${(probAny0Pts * 100).toFixed(1)}%</td><td>${oddAny0Pts}</td></tr></tbody></table>`;

            calculatedOddsResultContentEl.innerHTML = html;

            const displayAvgAndOU = (dataKey, expectedElId, resultElId) => {
                const resultElement = document.getElementById(resultElId);
                const expectedElement = document.getElementById(expectedElId);
                const ouMarginDecimal = parseFloat(document.getElementById('ouBookieMargin').value) / 100;

                if (groupData[dataKey] && groupData[dataKey].length > 0 && currentNumSims > 0) {
                    const avg = groupData[dataKey].reduce((a, b) => a + b, 0) / currentNumSims;
                    expectedElement.textContent = `(Avg: ${avg.toFixed(2)})`;

                    const centerLine = Math.round(avg) + 0.5;
                    const lines = [centerLine - 1, centerLine, centerLine + 1].filter(l => l > 0); 
                    let ouHtml = `<table class="w-full text-center"><thead><tr class="text-gray-500"><th class="w-1/3">Line</th><th class="w-1/3">Over</th><th class="w-1/3">Under</th></tr></thead><tbody>`;

                    lines.forEach(line => {
                         const overCount = groupData[dataKey].filter(val => val > line).length;
                         const underCount = groupData[dataKey].filter(val => val < line).length;
                         const probOver = overCount / currentNumSims;
                         const probUnder = underCount / currentNumSims;
                         const oddOver = calculateOddWithMargin(probOver, ouMarginDecimal);
                         const oddUnder = calculateOddWithMargin(probUnder, ouMarginDecimal);
                         ouHtml += `<tr><td>${line.toFixed(1)}</td><td>${oddOver}</td><td>${oddUnder}</td></tr>`;
                    });
                     ouHtml += `</tbody></table>`;
                     resultElement.innerHTML = ouHtml;

                } else {
                     expectedElement.textContent = '';
                     resultElement.innerHTML = '';
                }
            };

            displayAvgAndOU('groupTotalGoalsSims', 'expectedTotalGroupGoals', 'ouTotalGroupGoalsResult');
            displayAvgAndOU('firstPlacePtsSims', 'expectedFirstPlacePts', 'ouFirstPlacePtsResult');
            displayAvgAndOU('fourthPlacePtsSims', 'expectedFourthPlacePts', 'ouFourthPlacePtsResult');
            displayAvgAndOU('firstPlaceGFSims', 'expectedFirstPlaceGF', 'ouFirstPlaceGFResult');
            displayAvgAndOU('fourthPlaceGFSims', 'expectedFourthPlaceGF', 'ouFourthPlaceGFResult');
        });

        showTournamentTeamOddsButtonEl.addEventListener('click', () => {
            const team = tournamentTeamSelectEl.value;
            const marginPercent = parseFloat(tournamentBookieMarginEl.value);
            tournamentTeamOddsStatusEl.textContent = '';
            tournamentTeamOddsResultContentEl.innerHTML = '';

            if (isNaN(marginPercent) || marginPercent < 0) { tournamentTeamOddsStatusEl.textContent = 'Enter a valid non-negative margin.'; return; }
            if (currentNumSims === 0) { tournamentTeamOddsStatusEl.textContent = 'Run simulation first.'; return; }

            const marginDecimal = marginPercent / 100;

            const teamProgress = simulationAggStats?._knockout?.teamProgress || {};
            const allTeamsWithKnockoutData = Object.keys(teamProgress).sort((a, b) => a.localeCompare(b));
            if (allTeamsWithKnockoutData.length === 0) {
                tournamentTeamOddsStatusEl.textContent = 'No knockout/tournament stats available.';
                return;
            }

            const winnerSelections = allTeamsWithKnockoutData.map(teamName => {
                const teamStats = teamProgress[teamName];
                const winProbability = (teamStats?.winFINAL || 0) / currentNumSims;
                const winnerOdd = calculateOddWithMargin(winProbability, marginDecimal);
                const impliedProbability = winnerOdd === "N/A" ? 0 : 1 / Number(winnerOdd);
                return { teamName, winProbability, winnerOdd, impliedProbability };
            });
            const totalWinnerImpliedProbability = winnerSelections.reduce((sum, selection) => sum + selection.impliedProbability, 0);
            const totalWinnerMarginPercent = (totalWinnerImpliedProbability - 1) * 100;

            let html = `<h3 class="text-lg font-semibold text-purple-600 mb-2">Tournament Winner Odds (Margin: ${marginPercent}%)</h3>`;
            html += `<table class="odds-table text-xs sm:text-sm"><thead><tr><th>Selection</th><th>Prob</th><th>Odd</th></tr></thead><tbody>`;
            winnerSelections.forEach(({ teamName, winProbability, winnerOdd }) => {
                html += `<tr><td>${teamName}</td><td>${(winProbability * 100).toFixed(1)}%</td><td>${winnerOdd}</td></tr>`;
            });
            html += `</tbody></table>`;
            html += `<p class="text-xs text-gray-600 -mt-2 mb-2"><strong>Total winner market margin:</strong> ${totalWinnerMarginPercent.toFixed(2)}% (sum implied probability: ${(totalWinnerImpliedProbability * 100).toFixed(2)}%).</p>`;

            if (!team) {
                html += `<p class="text-xs text-gray-500">Tip: select a team to also view team-specific knockout and tournament totals markets.</p>`;
                tournamentTeamOddsResultContentEl.innerHTML = html;
                return;
            }

            const stats = teamProgress[team];
            if (!stats) {
                html += `<p class="text-xs text-red-500">No team-level knockout/tournament stats available for ${team}.</p>`;
                tournamentTeamOddsResultContentEl.innerHTML = html;
                return;
            }

            const marketRows = [
                ['Reach Round 16', stats.reachR16], ['Reach Quarterfinals', stats.reachQF], ['Reach Semifinals', stats.reachSF],
                ['Reach Final', stats.reachFINAL], ['Eliminate in Round 32', stats.eliminateR32], ['Eliminate in Round 16', stats.eliminateR16],
                ['Eliminate in Quarterfinals', stats.eliminateQF], ['Eliminate in Semifinals', stats.eliminateSF], ['Runner-up', stats.runnerUpCount],
                ['Winner', stats.winFINAL], ['3rd place', stats.thirdPlaceCount]
            ];

            html += `<h3 class="text-lg font-semibold text-purple-600 mt-4 mb-2">${team} Team Tournament Odds</h3>`;
            html += `<table class="odds-table text-xs sm:text-sm"><thead><tr><th>Market</th><th>Prob</th><th>Odd</th></tr></thead><tbody>`;
            marketRows.forEach(([label, count]) => {
                const prob = (count || 0) / currentNumSims;
                html += `<tr><td>${label}</td><td>${(prob * 100).toFixed(1)}%</td><td>${calculateOddWithMargin(prob, marginDecimal)}</td></tr>`;
            });
            html += `</tbody></table>`;

            const goalsForAvg = (stats.tournamentGfSims || []).reduce((a, b) => a + b, 0) / currentNumSims;
            const goalsAgainstAvg = (stats.tournamentGaSims || []).reduce((a, b) => a + b, 0) / currentNumSims;
            const gamesAvg = (stats.tournamentGamesSims || []).reduce((a, b) => a + b, 0) / currentNumSims;
            html += `<h4 class="font-medium text-gray-700 mt-3 mb-1">Scored Goals in Tournament O/U <span class="expected-value-info">(Avg: ${goalsForAvg.toFixed(2)})</span></h4>`;
            html += renderOverUnderRows(stats.tournamentGfSims, [Math.max(0.5, Math.floor(goalsForAvg) - 0.5), Math.floor(goalsForAvg) + 0.5, Math.floor(goalsForAvg) + 1.5], marginDecimal);
            html += `<h4 class="font-medium text-gray-700 mt-3 mb-1">Received Goals in Tournament O/U <span class="expected-value-info">(Avg: ${goalsAgainstAvg.toFixed(2)})</span></h4>`;
            html += renderOverUnderRows(stats.tournamentGaSims, [Math.max(0.5, Math.floor(goalsAgainstAvg) - 0.5), Math.floor(goalsAgainstAvg) + 0.5, Math.floor(goalsAgainstAvg) + 1.5], marginDecimal);
            html += `<h4 class="font-medium text-gray-700 mt-3 mb-1">Total Games in Tournament O/U <span class="expected-value-info">(Avg: ${gamesAvg.toFixed(2)})</span></h4>`;
            html += renderOverUnderRows(stats.tournamentGamesSims, [2.5, 3.5, 4.5, 5.5, 6.5], marginDecimal);

            tournamentTeamOddsResultContentEl.innerHTML = html;
        });

        calculateCustomProbAndOddButtonEl.addEventListener('click', () => {
            const groupKey = simGroupSelectEl.value;
            const teamName = simTeamSelectEl.value;
            const marginPercent = parseFloat(simBookieMarginEl.value);
            const statType = simCustomStatTypeEl.value;
            const operator = simCustomOperatorEl.value;
            const value1 = parseFloat(simCustomValue1El.value);
            let value2 = null;
            if (operator === 'between') value2 = parseFloat(simCustomValue2El.value);

            customProbAndOddResultAreaEl.innerHTML = ""; 

            if (!groupKey || !teamName) { customProbAndOddResultAreaEl.innerHTML = '<p class="text-red-500">Select group and team.</p>'; return; }
            if (isNaN(marginPercent) || marginPercent < 0) { customProbAndOddResultAreaEl.innerHTML = '<p class="text-red-500">Valid margin needed.</p>'; return; }
            if (isNaN(value1) || (operator === 'between' && isNaN(value2))) { customProbAndOddResultAreaEl.innerHTML = '<p class="text-red-500">Invalid Value(s) for prop.</p>'; return; }
            if (operator === 'between' && value1 >= value2) { customProbAndOddResultAreaEl.innerHTML = '<p class="text-red-500">For "Between", Value 1 must be < Value 2.</p>'; return; }
            
            const teamData = simulationAggStats[groupKey]?.[teamName];
            if (!teamData || !teamData[statType] || !teamData[statType].length || currentNumSims === 0) { customProbAndOddResultAreaEl.innerHTML = '<p class="text-gray-500">No simulation data for this specific prop.</p>'; return; }

            const simValues = teamData[statType];
            let metConditionCount = 0;
            simValues.forEach(simVal => {
                let conditionMet = false;
                switch (operator) {
                    case '>': conditionMet = simVal > value1; break;
                    case '>=': conditionMet = simVal >= value1; break;
                    case '<': conditionMet = simVal < value1; break;
                    case '<=': conditionMet = simVal <= value1; break;
                    case '==': conditionMet = Math.abs(simVal - value1) < 0.001; break;
                    case 'between': conditionMet = simVal >= value1 && simVal <= value2; break;
                }
                if (conditionMet) metConditionCount++;
            });
            
            const trueProbability = metConditionCount / currentNumSims;
            const marginDecimal = marginPercent / 100;
            const odd = calculateOddWithMargin(trueProbability, marginDecimal);

            let propDescription = `${teamName} ${statType.replace('Sims','')} ${operator} ${value1}`;
            if (operator === 'between') propDescription += ` and ${value2}`;

            customProbAndOddResultAreaEl.innerHTML = `
                <p><strong>Prop:</strong> ${propDescription}</p>
                <p><strong>Simulated Probability:</strong> ${(trueProbability * 100).toFixed(1)}%</p>
                <p><strong>Calculated Odd (with ${marginPercent}% margin):</strong> ${odd}</p>`;
        });

        // --- Clear Button ---
        clearButtonEl.addEventListener('click', () => {
            matchDataEl.value = ""; numSimulationsEl.value = "10000"; statusAreaEl.innerHTML = ""; resultsContentEl.innerHTML = "Results will appear here...";
            eloDataEl.value = "";
            bracketDataEl.value = "";
            parsedMatches=[]; parsedBracketMatches=[]; teamEloRatings={}; allTeams.clear(); groupedMatches={}; groupTeamNames={}; simulationAggStats={}; currentNumSims=0;
            runButtonEl.disabled=true; loaderEl.classList.add('hidden'); parseButtonEl.disabled=false;
            csvFileInputEl.value=null; csvFileNameEl.textContent="No file selected.";
            eloCsvFileInputEl.value=null; eloCsvFileNameEl.textContent="No file selected.";
            bracketCsvFileInputEl.value=null; bracketCsvFileNameEl.textContent="No file selected.";
            populateSimGroupSelect(); 
            populateTournamentTeamSelect();
            calculatedOddsResultContentEl.innerHTML = 'Select a group and click "Show/Refresh Market Odds" to see results.';
            simulatedOddsStatusEl.textContent = "";
            customProbInputsContainerEl.classList.add('hidden');
            customProbAndOddResultAreaEl.innerHTML = "Custom prop odds will appear here...";
            // Clear O/U sections
            document.getElementById('ouTotalGroupGoalsResult').innerHTML = '';
            document.getElementById('expectedTotalGroupGoals').textContent = '';
            document.getElementById('ouFirstPlacePtsResult').innerHTML = '';
            document.getElementById('expectedFirstPlacePts').textContent = '';
            document.getElementById('ouFourthPlacePtsResult').innerHTML = '';
            document.getElementById('expectedFourthPlacePts').textContent = '';
            document.getElementById('ouFirstPlaceGFResult').innerHTML = '';
            document.getElementById('expectedFirstPlaceGF').textContent = '';
            document.getElementById('ouFourthPlaceGFResult').innerHTML = '';
            document.getElementById('expectedFourthPlaceGF').textContent = '';
            tournamentTeamOddsStatusEl.textContent = '';
            tournamentTeamOddsResultContentEl.innerHTML = 'Click "Show Tournament Odds" to view winner market odds and margin.';
        });

        // --- Initial Sample Data ---
        matchDataEl.value = `A Germany vs Scotland 1.30 5.50 11.00 2.10 1.70
A Hungary vs Switzerland 3.50 3.20 2.25 1.60 2.30
A Germany vs Hungary 1.30 5.00 10.00 2.30 1.60
A Scotland vs Switzerland 4.50 3.60 1.85 1.70 2.15
A Switzerland vs Germany 5.00 4.00 1.70 2.00 1.80
A Scotland vs Hungary 2.80 3.40 2.50 1.90 1.90
B Spain vs Croatia 1.90 3.40 4.50 1.75 2.10
B Italy vs Albania 1.40 4.50 9.00 1.90 1.90
B Croatia vs Albania 1.50 4.00 7.50 1.80 2.00
B Spain vs Italy 2.20 3.20 3.60 1.65 2.20
B Albania vs Spain 10.00 5.50 1.30 2.00 1.80
B Croatia vs Italy 3.00 3.10 2.60 1.55 2.40`;
        eloDataEl.value = ``;

        window.openTab = openTab; 
        populateTieBreakPresets();
        populateAdvancementPresets();
        updateInputModeUi();
        populateTournamentTeamSelect();
        simCustomOperatorEl.addEventListener('change', () => { 
            if (simCustomOperatorEl.value === 'between') simCustomValue2El.classList.remove('hidden');
            else simCustomValue2El.classList.add('hidden');
        });

        generateTeamCsvButtonEl.addEventListener('click', () => {
            const groupKey = simGroupSelectEl.value;
            const teamName = simTeamSelectEl.value;
            const marginPercent = parseFloat(simBookieMarginEl.value);
            const marginDecimal = marginPercent / 100;
            const advancementPreset = getSelectedAdvancementPreset();
            
            if (!groupKey || !teamName) {
                alert("Please select a group and a team first.");
                return;
            }
             if (isNaN(marginPercent) || marginPercent < 0) {
                alert("Please enter a valid non-negative margin.");
                return;
            }

            const teamData = simulationAggStats[groupKey]?.[teamName];
            if (!teamData) {
                alert("No simulation data found for the selected team.");
                return;
            }

            let csvContent = "Date,Time,Market,Odd1,Odd2,Odd3\n";
            const { date, time } = getCsvExportDateTime();
            
            const toCsvRow = (market, odd1 = '', odd2 = '', odd3 = '') => `${date},${time},"${market}",${odd1},${odd2},${odd3}\n`;

            const prob1st = (teamData.posCounts[0] || 0) / currentNumSims;
            const odd1st = calculateOddWithMargin(prob1st, marginDecimal);
            csvContent += toCsvRow("Pobednik grupe", odd1st);

            const probQualify = (teamData.advanceToKnockoutCount || 0) / currentNumSims;
            const oddQualify = calculateOddWithMargin(probQualify, marginDecimal);
            csvContent += toCsvRow(`Prolazi dalje (${advancementPreset.label})`, oddQualify);

            const prob2nd = (teamData.posCounts[1] || 0) / currentNumSims;
            const odd2nd = calculateOddWithMargin(prob2nd, marginDecimal);
            csvContent += toCsvRow("2. mesto u grupi", odd2nd);

            const prob3rd = (teamData.posCounts[2] || 0) / currentNumSims;
            const odd3rd = calculateOddWithMargin(prob3rd, marginDecimal);
            csvContent += toCsvRow("3. mesto u grupi", odd3rd);

            const probDirectQualify = (teamData.autoQualifyCount || 0) / currentNumSims;
            csvContent += toCsvRow(`Direktan prolaz (Top ${advancementPreset.autoQualifiersPerGroup})`, calculateOddWithMargin(probDirectQualify, marginDecimal));

            const probBestThirdQualify = (teamData.bestThirdQualifyCount || 0) / currentNumSims;
            csvContent += toCsvRow("Prolaz kao najbolja 3.", calculateOddWithMargin(probBestThirdQualify, marginDecimal));

            const prob4th = (teamData.posCounts[3] || 0) / currentNumSims;
            const odd4th = calculateOddWithMargin(prob4th, marginDecimal);
            csvContent += toCsvRow("4. mesto u grupi", odd4th);

            const ptsSims = teamData.ptsSims;
            [0,1,2,3,4,5,6,7,9].forEach(pts => {
                const probPts = ptsSims.filter(p => p === pts).length / currentNumSims;
                const oddPts = calculateOddWithMargin(probPts, marginDecimal);
                csvContent += toCsvRow(`${pts} bodova u grupi`, oddPts);
            });

            const range1_3 = ptsSims.filter(p => p >= 1 && p <= 3).length / currentNumSims;
            csvContent += toCsvRow("1-3 boda u grupi", calculateOddWithMargin(range1_3, marginDecimal));
            const range2_4 = ptsSims.filter(p => p >= 2 && p <= 4).length / currentNumSims;
            csvContent += toCsvRow("2-4 boda u grupi", calculateOddWithMargin(range2_4, marginDecimal));
            const range4_6 = ptsSims.filter(p => p >= 4 && p <= 6).length / currentNumSims;
            csvContent += toCsvRow("4-6 bodova u grupi", calculateOddWithMargin(range4_6, marginDecimal));
            
            [5.5, 6.5, 7.5].forEach(line => {
                const overProb = ptsSims.filter(p => p > line).length / currentNumSims;
                const underProb = ptsSims.filter(p => p < line).length / currentNumSims;
                const overOdd = calculateOddWithMargin(overProb, marginDecimal);
                const underOdd = calculateOddWithMargin(underProb, marginDecimal);
                csvContent += toCsvRow(`Osvojenih bodova u grupi`, line, overOdd, underOdd);
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            if (link.download !== undefined) { 
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", `odds_${teamName.replace(/\s+/g, '_')}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        });

        generateGroupCsvButtonEl.addEventListener('click', () => {
            const groupKey = simGroupSelectEl.value;
            const marginPercent = parseFloat(simBookieMarginEl.value);
            const marginDecimal = marginPercent / 100;

            if (!groupKey) {
                alert("Please select a group first.");
                return;
            }
             if (isNaN(marginPercent) || marginPercent < 0) {
                alert("Please enter a valid non-negative margin.");
                return;
            }
            const groupData = simulationAggStats[groupKey];
            const teams = groupTeamNames[groupKey] || [];
            if (!groupData || teams.length === 0) {
                alert("No simulation data found for the selected group.");
                return;
            }

            let csvContent = `LEAGUE_NAME: Grupa ${groupKey}\n`;
            const { date, time } = getCsvExportDateTime();
            const toCsvRow = (market, submarket, odd1 = '', odd2 = '', odd3 = '') => `${date},${time},"${market}","${submarket}",${odd1},${odd2},${odd3}\n`;
            
            // Group Specials
            const prob9pts = (groupData.anyTeam9PtsCount || 0) / currentNumSims;
            csvContent += toCsvRow('Bilo koji tim', '9 bodova', calculateOddWithMargin(prob9pts, marginDecimal));
            const prob0pts = (groupData.anyTeam0PtsCount || 0) / currentNumSims;
            csvContent += toCsvRow('Bilo koji tim', '0 bodova', calculateOddWithMargin(prob0pts, marginDecimal));

            // Over/Under for 1st/4th place points
            const firstPtsSims = groupData.firstPlacePtsSims || [];
            if(firstPtsSims.length > 0) {
                [4.5, 6.5, 7.5].forEach(line => {
                    const overProb = firstPtsSims.filter(p => p > line).length / currentNumSims;
                    const underProb = firstPtsSims.filter(p => p < line).length / currentNumSims;
                    csvContent += toCsvRow('Uk. bodova', 'Prvoplasirani tim', line, calculateOddWithMargin(overProb, marginDecimal), calculateOddWithMargin(underProb, marginDecimal));
                });
            }
            const fourthPtsSims = groupData.fourthPlacePtsSims || [];
            if(fourthPtsSims.length > 0) {
                 [0.5, 1.5, 2.5].forEach(line => {
                    const overProb = fourthPtsSims.filter(p => p > line).length / currentNumSims;
                    const underProb = fourthPtsSims.filter(p => p < line).length / currentNumSims;
                    csvContent += toCsvRow('Uk. bodova', 'Poslednjeplasirani tim', line, calculateOddWithMargin(overProb, marginDecimal), calculateOddWithMargin(underProb, marginDecimal));
                });
            }

            // Straight Forecasts
            const allSF = Object.entries(groupData.straightForecasts || {}).sort(([,a],[,b])=>b-a);
            allSF.forEach(([key, count]) => {
                const prob = count / currentNumSims;
                const marketName = key.replace(' (1st) - ', '/').replace(' (2nd)', '');
                csvContent += toCsvRow(marketName, "Tacan poredak 1-2", calculateOddWithMargin(prob, marginDecimal));
            });

            // Advancing Doubles
             const allAD = Object.entries(groupData.advancingDoubles || {}).sort(([,a],[,b])=>b-a);
             allAD.forEach(([key, count]) => {
                const prob = count / currentNumSims;
                const marketName = key.replace(' & ', '/');
                csvContent += toCsvRow(marketName, "Prva dva u grupi", calculateOddWithMargin(prob, marginDecimal));
            });

            // Group Winner
            teams.forEach(team => {
                const prob = (groupData[team].posCounts[0] || 0) / currentNumSims;
                csvContent += toCsvRow(team, "Pobednik grupe", calculateOddWithMargin(prob, marginDecimal));
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            if (link.download !== undefined) { 
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", `group_odds_${groupKey}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        });


    
