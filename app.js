import { runKnockoutStage } from './modules/knockoutStage.js';
import { initializeKnockoutStats, incrementRoundReach } from './modules/knockoutStats.js';
import { initializeTabSwitching } from './modules/uiTabs.js';

                // --- Tab Switching Logic ---
        initializeTabSwitching();

// --- Global Variables ---
        let parsedMatches = [], parsedBracketMatches = [], teamEloRatings = {}, allTeams = new Set(), groupedMatches = {}, groupTeamNames = {}, simulationAggStats = {}, currentNumSims = 0;
        let lockedScenarios = {}; // key: "team1||team2", value: { g1, g2 }
        let currentLanguage = 'en';

        // --- Localization ---
        const translations = {
            en: {
                groupWinner: 'Group Winner',
                advanceFurther: 'Advance',
                place2: '2nd place in group',
                place3: '3rd place in group',
                place4: '4th place in group',
                directQual: 'Direct qualification (Top {n})',
                bestThirdQual: 'Qualify as best 3rd',
                ptsExact: '{n} points in group',
                pts1_3: '1-3 points in group',
                pts2_4: '2-4 points in group',
                pts4_6: '4-6 points in group',
                ptsOU: 'Points in group',
                anyTeam: 'Any team',
                pts9: '9 points',
                pts0: '0 points',
                firstPlaced: 'First-placed team',
                lastPlaced: 'Last-placed team',
                exactOrder12: 'Exact order 1st-2nd',
                topTwoAny: 'Top two in group',
                leagueName: 'Group {g}',
            },
            sr: {
                groupWinner: 'Pobednik grupe',
                advanceFurther: 'Prolazi dalje',
                place2: '2. mesto u grupi',
                place3: '3. mesto u grupi',
                place4: '4. mesto u grupi',
                directQual: 'Direktan prolaz (Top {n})',
                bestThirdQual: 'Prolaz kao najbolja 3.',
                ptsExact: '{n} bodova u grupi',
                pts1_3: '1-3 boda u grupi',
                pts2_4: '2-4 boda u grupi',
                pts4_6: '4-6 bodova u grupi',
                ptsOU: 'Osvojenih bodova u grupi',
                anyTeam: 'Bilo koji tim',
                pts9: '9 bodova',
                pts0: '0 bodova',
                firstPlaced: 'Prvoplasirani tim',
                lastPlaced: 'Poslednjeplasirani tim',
                exactOrder12: 'Tacan poredak 1-2',
                topTwoAny: 'Prva dva u grupi',
                leagueName: 'Grupa {g}',
            }
        };

        function t(key, vars = {}) {
            const str = (translations[currentLanguage] || translations.en)[key] || key;
            return str.replace(/\{(\w+)\}/g, (_, k) => vars[k] !== undefined ? vars[k] : `{${k}}`);
        }

        // --- DOM Elements ---
        const matchDataEl = document.getElementById('matchData'), numSimulationsEl = document.getElementById('numSimulations');
        const numSimulationsPresetEl = document.getElementById('numSimulationsPreset');
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
        const generateTournamentTeamCsvButtonEl = document.getElementById('generateTournamentTeamCsvButton');
        const generateTournamentTeamCsvErrorEl = document.getElementById('generateTournamentTeamCsvError');
        const tournamentTeamOddsStatusEl = document.getElementById('tournamentTeamOddsStatus');
        const tournamentTeamOddsResultContentEl = document.getElementById('tournamentTeamOddsResultContent');
        const lambdaViewContentEl = document.getElementById('lambdaViewContent');
        const scenarioLockSectionEl = document.getElementById('scenarioLockSection');
        const scenarioLockTableBodyEl = document.getElementById('scenarioLockTableBody');
        const clearLocksBtnEl = document.getElementById('clearLocksBtn');
        const exportRawDataSectionEl = document.getElementById('exportRawDataSection');
        const exportRawDataBtnEl = document.getElementById('exportRawDataBtn');
        const customOULinesEl = document.getElementById('customOULines');
        const showMultiGroupViewBtnEl = document.getElementById('showMultiGroupViewBtn');
        const multiGroupViewStatusEl = document.getElementById('multiGroupViewStatus');
        const multiGroupViewContentEl = document.getElementById('multiGroupViewContent');
        const multiGroupMarginEl = document.getElementById('multiGroupMargin');
        const langToggleBtnEl = document.getElementById('langToggleBtn');
        const matchDataSectionEl = document.getElementById('matchDataSection');
        const eloSectionEl = document.getElementById('eloSection');
        const exportRawDataErrorEl = document.getElementById('exportRawDataError');
        const generateTeamCsvErrorEl = document.getElementById('generateTeamCsvError');
        const generateGroupCsvErrorEl = document.getElementById('generateGroupCsvError');

        function syncSimulationPresetFromInput() {
            const trimmedValue = numSimulationsEl.value.trim();
            if (!trimmedValue) {
                numSimulationsPresetEl.value = 'custom';
                return;
            }
            const presetOption = Array.from(numSimulationsPresetEl.options).find(option => option.value === trimmedValue);
            numSimulationsPresetEl.value = presetOption ? trimmedValue : 'custom';
        }

        numSimulationsPresetEl.addEventListener('change', () => {
            if (numSimulationsPresetEl.value !== 'custom') {
                numSimulationsEl.value = numSimulationsPresetEl.value;
            }
            numSimulationsEl.focus();
        });

        numSimulationsEl.addEventListener('input', syncSimulationPresetFromInput);
        syncSimulationPresetFromInput();

        // --- Status Bar Helper ---
        const _STATUS_ICONS = {
            success: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>`,
            error:   `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
            warning: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
            info:    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
        };

        function renderStatus(type, message, { detail = null, items = [], warnings = [] } = {}) {
            const icon = _STATUS_ICONS[type] || _STATUS_ICONS.info;
            let html = `<div class="status-bar status-${type}"><span class="status-icon">${icon}</span><div class="status-body"><p>${message}</p>`;
            if (detail) html += `<p>${detail}</p>`;
            if (items.length) html += `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
            html += `</div></div>`;
            if (warnings.length) {
                html += `<div class="status-bar status-warning" style="margin-top:0.375rem"><span class="status-icon">${_STATUS_ICONS.warning}</span><div class="status-body"><p>Warnings (${warnings.length}):</p><ul>${warnings.map(w => `<li>${w}</li>`).join('')}</ul></div></div>`;
            }
            statusAreaEl.innerHTML = html;
        }

        function showInlineError(el, msg, duration = 4000) {
            if (!el) return;
            el.textContent = msg;
            el.classList.add('visible');
            if (duration > 0) setTimeout(() => el.classList.remove('visible'), duration);
        }

        // --- Probability CSS Class Helper ---
        function probToClass(pctVal) {
            if (isNaN(pctVal)) return '';
            if (pctVal >= 50) return 'prob-high';
            if (pctVal >= 20) return 'prob-mid';
            return 'prob-low';
        }

        function renderLambdaView() {
            if (!lambdaViewContentEl) return;
            if (!parsedMatches.length) {
                lambdaViewContentEl.innerHTML = 'Parse data first to inspect team and match lambdas.';
                return;
            }

            const teamRows = [];
            const teamStats = {};
            parsedMatches.forEach(match => {
                if (!teamStats[match.team1]) teamStats[match.team1] = { group: match.group, matches: 0, lambdaFor: 0, lambdaAgainst: 0, xPts: 0 };
                if (!teamStats[match.team2]) teamStats[match.team2] = { group: match.group, matches: 0, lambdaFor: 0, lambdaAgainst: 0, xPts: 0 };
                teamStats[match.team1].matches += 1;
                teamStats[match.team1].lambdaFor += match.lambda1;
                teamStats[match.team1].lambdaAgainst += match.lambda2;
                teamStats[match.team1].xPts += (3 * match.p1) + match.px;
                teamStats[match.team2].matches += 1;
                teamStats[match.team2].lambdaFor += match.lambda2;
                teamStats[match.team2].lambdaAgainst += match.lambda1;
                teamStats[match.team2].xPts += (3 * match.p2) + match.px;
            });

            Object.entries(teamStats)
                .sort(([teamA, statsA], [teamB, statsB]) => statsA.group.localeCompare(statsB.group) || teamA.localeCompare(teamB))
                .forEach(([team, stats]) => {
                    teamRows.push(`
                        <tr>
                            <td>${stats.group}</td>
                            <td class="font-medium">${team}</td>
                            <td>${stats.matches}</td>
                            <td>${stats.xPts.toFixed(3)}</td>
                            <td>${stats.lambdaFor.toFixed(3)}</td>
                            <td>${stats.lambdaAgainst.toFixed(3)}</td>
                            <td>${(stats.lambdaFor - stats.lambdaAgainst).toFixed(3)}</td>
                        </tr>
                    `);
                });

            lambdaViewContentEl.innerHTML = `
                <div class="mb-6">
                    <h3 class="text-base font-semibold text-gray-700 mb-2">Team Group-Stage Lambda Sums</h3>
                    <div class="overflow-x-auto">
                        <table class="odds-table text-xs sm:text-sm">
                            <thead>
                                <tr>
                                    <th>Group</th>
                                    <th>Team</th>
                                    <th>Matches</th>
                                    <th>xPts Sum</th>
                                    <th>Lambda For Sum</th>
                                    <th>Lambda Against Sum</th>
                                    <th>Net Lambda Sum</th>
                                </tr>
                            </thead>
                            <tbody>${teamRows.join('')}</tbody>
                        </table>
                    </div>
                </div>
                <div>
                    <h3 class="text-base font-semibold text-gray-700 mb-2">Match Lambdas</h3>
                    <div class="overflow-x-auto">
                        <table class="odds-table text-xs sm:text-sm">
                            <thead>
                                <tr>
                                    <th>Group</th>
                                    <th>Line</th>
                                    <th>Team 1</th>
                                    <th>Team 2</th>
                                    <th>Team 1 xPts</th>
                                    <th>Team 2 xPts</th>
                                    <th>Lambda 1</th>
                                    <th>Lambda 2</th>
                                    <th>Total</th>
                                    <th>Supremacy</th>
                                </tr>
                            </thead>
                            <tbody>${parsedMatches
                                .slice()
                                .sort((a, b) => a.group.localeCompare(b.group) || a.lineNum - b.lineNum)
                                .map(match => `
                                    <tr>
                                        <td>${match.group}</td>
                                        <td>${match.lineNum}</td>
                                        <td class="font-medium">${match.team1}</td>
                                        <td class="font-medium">${match.team2}</td>
                                        <td>${((3 * match.p1) + match.px).toFixed(3)}</td>
                                        <td>${((3 * match.p2) + match.px).toFixed(3)}</td>
                                        <td>${match.lambda1.toFixed(3)}</td>
                                        <td>${match.lambda2.toFixed(3)}</td>
                                        <td>${(match.lambda1 + match.lambda2).toFixed(3)}</td>
                                        <td>${(match.lambda1 - match.lambda2).toFixed(3)}</td>
                                    </tr>
                                `)
                                .join('')}</tbody>
                        </table>
                    </div>
                </div>
            `;
        }

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
                reader.onload = (e) => { matchDataEl.value = e.target.result; renderStatus('info', 'CSV loaded. Click "Parse &amp; Validate Data".'); };
                reader.onerror = (e) => { renderStatus('error', `Error reading file: ${e.target.error.name}`); csvFileNameEl.textContent = "No file selected."; };
                reader.readAsText(file);
            } else { csvFileNameEl.textContent = "No file selected."; }
        });

        eloCsvFileInputEl.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                eloCsvFileNameEl.textContent = file.name;
                const reader = new FileReader();
                reader.onload = (e) => { eloDataEl.value = e.target.result; renderStatus('info', 'Elo CSV loaded. Click "Parse &amp; Validate Data".'); };
                reader.onerror = (e) => { renderStatus('error', `Error reading Elo file: ${e.target.error.name}`); eloCsvFileNameEl.textContent = "No file selected."; };
                reader.readAsText(file);
            } else { eloCsvFileNameEl.textContent = "No file selected."; }
        });

        bracketCsvFileInputEl.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                bracketCsvFileNameEl.textContent = file.name;
                const reader = new FileReader();
                reader.onload = (e) => { bracketDataEl.value = e.target.result; renderStatus('info', 'Bracket CSV loaded. Click "Parse &amp; Validate Data".'); };
                reader.onerror = (e) => { renderStatus('error', `Error reading bracket file: ${e.target.error.name}`); bracketCsvFileNameEl.textContent = "No file selected."; };
                reader.readAsText(file);
            } else { bracketCsvFileNameEl.textContent = "No file selected."; }
        });

        function updateInputModeUi() {
            const mode = inputModeEl.value;
            const isEloMode = mode === 'elo';
            const isHybridMode = mode === 'hybrid';
            const isOddsMode = mode === 'odds';

            // Show/hide whole sections instead of just disabling
            if (matchDataSectionEl) matchDataSectionEl.classList.toggle('hidden', isEloMode);
            if (eloSectionEl) eloSectionEl.classList.toggle('hidden', isOddsMode);

            // Keep disabled flags in sync for form submission safety
            matchDataEl.disabled = isEloMode;
            csvFileInputEl.disabled = isEloMode;
            eloDataEl.disabled = isOddsMode;
            eloCsvFileInputEl.disabled = isOddsMode;

            parseButtonEl.textContent = isEloMode
                ? 'Parse Elo & Build Fixtures'
                : (isHybridMode ? 'Parse Hybrid Data' : 'Parse & Validate Data');
        }
        inputModeEl.addEventListener('change', updateInputModeUi);
        
        // --- xG Calculation & Helpers ---
        function poissonPMF(mu, k) {
            if (mu < 0 || k < 0 || !Number.isInteger(k)) return 0;
            if (mu === 0) return k === 0 ? 1 : 0;
            // Use log-space arithmetic to avoid factorial overflow for large k
            let logP = k * Math.log(mu) - mu;
            for (let i = 1; i <= k; i++) logP -= Math.log(i);
            return Math.exp(logP);
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
            const tol = 1e-7;
            const maxIter = 100;

            // Stage 1: bisect on totalGoals (with supremacy=0) to match P(under 2.5).
            // P(under 2.5) is monotone DECREASING in totalGoals, so this always converges.
            let lo1 = 0.05, hi1 = 22.0;
            let totalGoals = 2.5;
            for (let iter = 0; iter < maxIter; iter++) {
                totalGoals = (lo1 + hi1) / 2;
                const xg = totalGoals / 2;
                const p = calculateModelProbsFromXG(xg, xg, 2.5);
                if (Math.abs(p.modelProbUnderNoExact - normalisedUnder) < tol) break;
                // P(under) too high → need more goals to push probability down
                if (p.modelProbUnderNoExact > normalisedUnder) lo1 = totalGoals;
                else hi1 = totalGoals;
            }

            // Stage 2: bisect on supremacy to match P(home wins no draw).
            // P(home wins no draw) is monotone INCREASING in supremacy, so this always converges.
            const maxSupremacy = totalGoals - 0.02;
            let lo2 = -maxSupremacy, hi2 = maxSupremacy;
            let supremacy = 0;
            let homeExpectedGoals = totalGoals / 2, awayExpectedGoals = totalGoals / 2;
            let finalError = 0;
            for (let iter = 0; iter < maxIter; iter++) {
                supremacy = (lo2 + hi2) / 2;
                homeExpectedGoals = Math.max(0.01, totalGoals / 2 + supremacy / 2);
                awayExpectedGoals = Math.max(0.01, totalGoals / 2 - supremacy / 2);
                const p = calculateModelProbsFromXG(homeExpectedGoals, awayExpectedGoals, 2.5);
                const err = p.modelProbHomeWinNoDraw - normalisedHomeNoDraw;
                finalError = Math.abs(err);
                if (finalError < tol) break;
                if (err > 0) hi2 = supremacy;
                else lo2 = supremacy;
            }

            const converged = finalError < 0.001;
            return { homeXG: homeExpectedGoals, awayXG: awayExpectedGoals, converged };
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

        function normalizeAliasKey(value) {
            return String(value || '')
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/\./g, '')
                .replace(/&/g, ' and ')
                .replace(/[^a-zA-Z0-9]+/g, ' ')
                .trim()
                .toLowerCase();
        }

        const TEAM_NAME_ALIASES = {
            'bosnia and herzegovina': 'Bosnia & Herzegovina',
            'curacao': 'Curaçao',
            'dr congo': 'DR Congo',
            'd r congo': 'DR Congo',
            'democratic republic congo': 'DR Congo'
        };

        function canonicalizeTeamName(teamName) {
            const cleaned = String(teamName || '').trim();
            return TEAM_NAME_ALIASES[normalizeAliasKey(cleaned)] || cleaned;
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

        function csvEscape(value) {
            const stringValue = value === undefined || value === null ? '' : String(value);
            return `"${stringValue.replace(/"/g, '""')}"`;
        }

        function buildCsvRow(cells) {
            return cells.map(csvEscape).join(',') + '\n';
        }

        function average(values) {
            return values && values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
        }

        function getLineProbabilities(values, line) {
            if (!values || !values.length || currentNumSims === 0) {
                return { overProb: 0, underProb: 0 };
            }
            const overProb = values.filter(value => value > line).length / currentNumSims;
            const underProb = values.filter(value => value < line).length / currentNumSims;
            return { overProb, underProb };
        }

        function findBalancedHalfPointLine(values, fallbackMean = 0) {
            if (!values || !values.length) {
                return Math.max(0.5, Math.floor(fallbackMean) + 0.5);
            }
            const maxValue = Math.max(...values);
            const meanValue = average(values);
            let bestLine = 0.5;
            let bestGap = Number.POSITIVE_INFINITY;
            let bestMeanDistance = Number.POSITIVE_INFINITY;
            for (let base = 0; base <= Math.max(maxValue + 1, Math.ceil(meanValue) + 1); base++) {
                const line = base + 0.5;
                const { overProb, underProb } = getLineProbabilities(values, line);
                const gap = Math.abs(overProb - underProb);
                const meanDistance = Math.abs(line - fallbackMean);
                if (gap < bestGap - 1e-9 || (Math.abs(gap - bestGap) < 1e-9 && meanDistance < bestMeanDistance)) {
                    bestGap = gap;
                    bestMeanDistance = meanDistance;
                    bestLine = line;
                }
            }
            return bestLine;
        }

        function buildDynamicHalfPointLines(values, fallbackMean = 0) {
            const balanced = findBalancedHalfPointLine(values, fallbackMean);
            return [balanced, balanced + 1, Math.max(0.5, balanced - 1)];
        }

        // --- Scenario Locking ---
        function buildScenarioLockUI() {
            if (!parsedMatches || parsedMatches.length === 0) {
                scenarioLockSectionEl.classList.add('hidden');
                return;
            }
            scenarioLockSectionEl.classList.remove('hidden');
            scenarioLockTableBodyEl.innerHTML = '';
            parsedMatches.forEach((m, idx) => {
                const key = buildMatchPairKey(m.team1, m.team2);
                const currentLock = lockedScenarios[key] || null;
                const tr = document.createElement('tr');
                tr.className = idx % 2 === 0 ? 'bg-white' : 'bg-amber-50';
                tr.innerHTML = `
                    <td class="px-3 py-1.5 text-gray-600">Gr. ${m.group}</td>
                    <td class="px-3 py-1.5 font-medium">${m.team1} vs ${m.team2}</td>
                    <td class="px-3 py-1.5">
                        <div class="scenario-lock-score-row">
                            <input type="number" min="0" step="1" inputmode="numeric" data-match-key="${key}" data-team-side="team1" value="${currentLock ? currentLock.g1 : ''}" class="scenario-lock-score-input border border-amber-300 rounded px-2 py-1 text-xs bg-white" placeholder="${m.team1}">
                            <span class="text-amber-700 font-medium">:</span>
                            <input type="number" min="0" step="1" inputmode="numeric" data-match-key="${key}" data-team-side="team2" value="${currentLock ? currentLock.g2 : ''}" class="scenario-lock-score-input border border-amber-300 rounded px-2 py-1 text-xs bg-white" placeholder="${m.team2}">
                            <button type="button" data-match-key="${key}" class="scenario-lock-clear border border-amber-300 rounded px-2 py-1 text-xs bg-white text-amber-800">Simulate</button>
                        </div>
                    </td>`;
                scenarioLockTableBodyEl.appendChild(tr);
            });

            function syncLockedScore(key) {
                const inputs = scenarioLockTableBodyEl.querySelectorAll(`.scenario-lock-score-input[data-match-key="${key}"]`);
                const team1Input = Array.from(inputs).find(input => input.dataset.teamSide === 'team1');
                const team2Input = Array.from(inputs).find(input => input.dataset.teamSide === 'team2');
                if (!team1Input || !team2Input) return;

                const raw1 = team1Input.value.trim();
                const raw2 = team2Input.value.trim();

                if (raw1 === '' && raw2 === '') {
                    delete lockedScenarios[key];
                    return;
                }

                const g1 = Number(raw1);
                const g2 = Number(raw2);
                if (Number.isInteger(g1) && g1 >= 0 && Number.isInteger(g2) && g2 >= 0) {
                    lockedScenarios[key] = { g1, g2 };
                } else {
                    delete lockedScenarios[key];
                }
            }

            scenarioLockTableBodyEl.querySelectorAll('.scenario-lock-score-input').forEach(input => {
                input.addEventListener('input', () => {
                    const key = input.dataset.matchKey;
                    syncLockedScore(key);
                });
            });

            scenarioLockTableBodyEl.querySelectorAll('.scenario-lock-clear').forEach(button => {
                button.addEventListener('click', () => {
                    const key = button.dataset.matchKey;
                    const inputs = scenarioLockTableBodyEl.querySelectorAll(`.scenario-lock-score-input[data-match-key="${key}"]`);
                    inputs.forEach(input => { input.value = ''; });
                    delete lockedScenarios[key];
                });
            });
        }

        function simulateLockedMatch(m, lockedScore) {
            return {
                g1: lockedScore?.g1 ?? 0,
                g2: lockedScore?.g2 ?? 0
            };
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
            return [canonicalizeTeamName(team1), canonicalizeTeamName(team2)]
                .sort((a, b) => a.localeCompare(b))
                .join('||');
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
                if (odds.some(o => o <= 1)) { errors.push(`L${index+1}: Odds must be >1.0. Odds:"${oddsStrings.join(', ')}". L:"${line}"`); return; }

                const [o1, ox, o2, oUnder25, oOver25] = odds;
                const sumInv1X2 = (1/o1)+(1/ox)+(1/o2); if (sumInv1X2 === 0) { errors.push(`L${index+1}: Sum inv 1X2 odds 0. L:"${line}"`); return; }
                const p1_market=(1/o1)/sumInv1X2, px_market=(1/ox)/sumInv1X2, p2_market=(1/o2)/sumInv1X2;

                const xGResult = calculateExpectedGoalsFromOdds(oOver25, oUnder25, o1, o2);
                let lambda1 = xGResult.homeXG;
                let lambda2 = xGResult.awayXG;

                if (!xGResult.converged) {
                   warnings.push(`L${index+1}: xG solver did not converge for ${team1Name} v ${team2Name} (residual error too large). Results may be less accurate.`);
                }
                if (isNaN(lambda1) || isNaN(lambda2) || lambda1 <=0 || lambda2 <=0) {
                   warnings.push(`L${index+1}: xG calc produced invalid values for ${team1Name} v ${team2Name}. Using fallback. H=${lambda1?.toFixed(2)},A=${lambda2?.toFixed(2)}`);
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

                team1Name = canonicalizeTeamName(team1Name);
                team2Name = canonicalizeTeamName(team2Name);

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
                const team = canonicalizeTeamName((parts[1] || '').trim());
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
                const team = canonicalizeTeamName((parts[1] || '').trim());
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
            const eloDiff = eloA - eloB;
            const diffAbs = Math.abs(eloA - eloB);
            const pANoDraw = eloProbNoDraw(eloA, eloB);
            const pDraw = clamp(0.22 + 0.10 * Math.exp(-diffAbs / 260), 0.18, 0.33);
            const expectedStrengthA = pANoDraw + 0.5 * pDraw;

            // Bayesian prior for neutral-site knockout scoring.
            // We start from a cautious baseline and let Elo contribute matchup-specific evidence.
            const priorTotalGoals = 2.35;
            const priorShareA = 0.5;
            const priorWeight = 8;

            // Elo-derived evidence:
            // 1) stronger mismatches tend to open total goals slightly
            // 2) win strength tilts the goal share away from 50/50
            const evidenceTotalGoals = 2.20 + Math.min(0.45, diffAbs / 700);
            const shareTilt = (expectedStrengthA - 0.5) * 1.15;
            const evidenceShareA = clamp(0.5 + shareTilt, 0.20, 0.80);
            const evidenceWeight = 2 + Math.min(6, diffAbs / 60);

            const posteriorTotalGoals =
                ((priorTotalGoals * priorWeight) + (evidenceTotalGoals * evidenceWeight)) /
                (priorWeight + evidenceWeight);
            const posteriorShareA =
                ((priorShareA * priorWeight) + (evidenceShareA * evidenceWeight)) /
                (priorWeight + evidenceWeight);

            // A small final Elo supremacy nudge keeps elite-vs-weak pairings from being too conservative
            // after the Bayesian shrinkage, while preserving realistic floors for both teams.
            const deltaAdjustment = clamp(eloDiff / 1200, -0.22, 0.22);
            const lambdaA = Math.max(0.05, (posteriorTotalGoals * posteriorShareA) + deltaAdjustment);
            const lambdaB = Math.max(0.05, posteriorTotalGoals - lambdaA);

            return { lambdaA, lambdaB, eloA, eloB };
        }

        function simulateKnockoutMatch(teamA, teamB) {
            const { lambdaA, lambdaB } = getKnockoutLambdasFromElo(teamA, teamB);
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
            const aWinsPens = Math.random() < 0.5;
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
                && (normalized[1] === 'MATCH' || normalized[1] === 'MATCH_ID' || normalized[1] === 'MATCHID');
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
                if (seenMatchIds.has(matchNum)) {
                    warnings.push(`Bracket L${index + 1}: Duplicate match number ${matchNum}; skipping this entry.`);
                    return;
                }
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
            if (errors.length > 0) {
                renderStatus('error', `Parse failed (${errors.length} error${errors.length > 1 ? 's' : ''})`, { items: errors, warnings });
                runButtonEl.disabled = true;
                renderLambdaView();
            } else {
                const modeLabel = mode === 'elo' ? 'Elo-generated fixtures' : (mode === 'hybrid' ? 'hybrid (odds + Elo fill)' : 'odds input');
                renderStatus('success', `Parsed ${parsedMatches.length} matches, ${Object.keys(groupedMatches).length} groups, ${allTeams.size} teams (${modeLabel}).`, {
                    detail: `Bracket rows: ${parsedBracketMatches.length}. Elo ratings: ${Object.keys(teamEloRatings).length} teams.`,
                    warnings
                });
                runButtonEl.disabled = false;
                resultsContentEl.innerHTML = "Parsed. Ready for sim.";
                buildScenarioLockUI();
                renderLambdaView();
            }
        });


        // --- Simulation Logic ---
        runButtonEl.addEventListener('click', () => {
            if (parsedMatches.length === 0) { renderStatus('error', 'No parsed data. Click "Parse &amp; Validate Data" first.'); return; }
            currentNumSims = parseInt(numSimulationsEl.value); if (isNaN(currentNumSims) || currentNumSims <= 0) { renderStatus('error', 'Number of simulations must be greater than 0.'); return; }
            loaderEl.classList.remove('hidden'); renderStatus('info', `Running ${currentNumSims.toLocaleString()} simulations...`);
            resultsContentEl.innerHTML = ""; runButtonEl.disabled = true; parseButtonEl.disabled = true;
            
            setTimeout(() => {
                try {
                    simulationAggStats = runSimulation(currentNumSims);
                    try {
                        displayResults(simulationAggStats, currentNumSims);
                    } catch (displayError) {
                        console.error("DisplayResults Error:", displayError);
                        statusAreaEl.innerHTML += `<div class="status-bar status-error" style="margin-top:0.375rem"><span class="status-icon">${_STATUS_ICONS.error}</span><div class="status-body"><p>Error displaying results: ${displayError.message}</p></div></div>`;
                    }
                    populateSimGroupSelect();
                    populateTournamentTeamSelect();
                    exportRawDataSectionEl.classList.remove('hidden');
                    multiGroupViewContentEl.innerHTML = 'Run simulation first, then click "Show Multi-Group Overview".';
                    renderStatus('success', `Simulation complete! (${currentNumSims.toLocaleString()} runs)`);
                } catch (simError) {
                    console.error("Sim Error:", simError);
                    renderStatus('error', `Error during simulation: ${simError.message}`);
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

        function runSimulation(numSims) {
            const aggStats={};
            const advancementPreset = getSelectedAdvancementPreset();
            const autoQualifiersPerGroup = Math.max(0, advancementPreset.autoQualifiersPerGroup || 0);
            const bestThirdSlots = Math.max(0, advancementPreset.bestThirdSlots || 0);
            for(const gr in groupedMatches){ 
                aggStats[gr]={
                    groupTotalGoalsSims:[], straightForecasts:{}, advancingDoubles:{}, 
                    groupTotalDrawsSims: [],
                    anyTeam9PtsCount:0, anyTeam0PtsCount:0, 
                    thirdPlaceAdvancesCount: 0,
                    firstPlacePtsSims:[], firstPlaceGFSims:[], 
                    fourthPlacePtsSims:[], fourthPlaceGFSims:[]
                }; 
                (groupTeamNames[gr]||[]).forEach(tN=>{
                    aggStats[gr][tN]={
                        posCounts:[0,0,0,0], ptsSims:[], gfSims:[], gaSims:[], winsSims: [],
                        drawsSims: [],
                        positionSims: [],
                        mostGFCount:0, mostGACount:0,
                        autoQualifyCount: 0, bestThirdQualifyCount: 0, advanceToKnockoutCount: 0,
                        scoreEveryGroupGameCount: 0,
                        noLossGroupCount: 0,
                        concedeEveryGroupGameCount: 0
                    };
                });
            }
            initializeKnockoutStats(aggStats, groupTeamNames);
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
                    tIG.forEach(t=>sTS[t]={name:t,pts:0,gf:0,ga:0,gd:0, wins: 0, draws: 0, scoredEveryGame: true, concededEveryGame: true, noLoss: true, groupGames: 0}); 
                    let cGTG=0, cGDraws=0;
                    const simulatedGroupMatches = [];
            
                    cGMs.forEach(m=>{
                        const lockKey = buildMatchPairKey(m.team1, m.team2);
                        const lockOutcome = lockedScenarios[lockKey];
                        let g1, g2;
                        if (lockOutcome) {
                            const locked = simulateLockedMatch(m, lockOutcome);
                            g1 = locked.g1; g2 = locked.g2;
                        } else {
                            g1 = poissonRandom(m.lambda1);
                            g2 = poissonRandom(m.lambda2);
                        }
                        simulatedGroupMatches.push({ team1: m.team1, team2: m.team2, g1, g2 });
                        if(sTS[m.team1]){sTS[m.team1].gf+=g1;sTS[m.team1].ga+=g2;sTS[m.team1].groupGames+=1;if(g1===0)sTS[m.team1].scoredEveryGame=false;if(g2===0)sTS[m.team1].concededEveryGame=false;} 
                        if(sTS[m.team2]){sTS[m.team2].gf+=g2;sTS[m.team2].ga+=g1;sTS[m.team2].groupGames+=1;if(g2===0)sTS[m.team2].scoredEveryGame=false;if(g1===0)sTS[m.team2].concededEveryGame=false;} 
                        cGTG+=(g1+g2); 
                        if(g1>g2){if(sTS[m.team1]){sTS[m.team1].pts+=3; sTS[m.team1].wins+=1;} if(sTS[m.team2]) sTS[m.team2].noLoss=false;}
                        else if(g2>g1){if(sTS[m.team2]){sTS[m.team2].pts+=3; sTS[m.team2].wins+=1;} if(sTS[m.team1]) sTS[m.team1].noLoss=false;}
                        else{
                            cGDraws+=1;
                            if(sTS[m.team1]){sTS[m.team1].pts+=1; sTS[m.team1].draws+=1;}
                            if(sTS[m.team2]){sTS[m.team2].pts+=1; sTS[m.team2].draws+=1;}
                        }
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
            
                    if(aggStats[gK]) {
                        aggStats[gK].groupTotalGoalsSims.push(cGTG);
                        aggStats[gK].groupTotalDrawsSims.push(cGDraws);
                    }
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
                            tA.drawsSims.push(t.draws || 0);
                            tA.gfSims.push(t.gf);
                            tA.gaSims.push(t.ga);
                            tA.positionSims.push(rI + 1);
                            if(t.gf===mGF&&mGF>0)tA.mostGFCount++;
                            if(t.ga===mGA&&mGA>0)tA.mostGACount++;
                            if (rI < autoQualifiersPerGroup) tA.autoQualifyCount++;
                            if (rI < autoQualifiersPerGroup) tA.advanceToKnockoutCount++;
                            if (t.scoredEveryGame && t.groupGames > 0) tA.scoreEveryGroupGameCount++;
                            if (t.noLoss && t.groupGames > 0) tA.noLossGroupCount++;
                            if (t.concededEveryGame && t.groupGames > 0) tA.concedeEveryGroupGameCount++;
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
                        if (aggStats[team.group]) aggStats[team.group].thirdPlaceAdvancesCount++;
                    });
                    if (parsedBracketMatches.length > 0) {
                        runKnockoutStage({
                            parsedBracketMatches,
                            aggStats,
                            groupStandings,
                            thirdRankedList: sortedThirds.slice(0, bestThirdSlots),
                            simTournamentTotals,
                            simulateKnockoutMatch,
                            incrementRoundReach
                        });
                    }
                }
                Object.entries(aggStats._knockout.teamProgress).forEach(([team, stats]) => {
                    const simTotals = simTournamentTotals[team] || { gf: 0, ga: 0, games: 0 };
                    stats.tournamentGfSims.push(simTotals.gf);
                    stats.tournamentGaSims.push(simTotals.ga);
                    stats.tournamentGamesSims.push(simTotals.games);
                });
                const tournamentTeams = Object.entries(simTournamentTotals);
                const maxTournamentGF = tournamentTeams.reduce((max, [, totals]) => Math.max(max, totals.gf), 0);
                const maxTournamentGA = tournamentTeams.reduce((max, [, totals]) => Math.max(max, totals.ga), 0);
                tournamentTeams.forEach(([team, totals]) => {
                    const kpStats = aggStats._knockout?.teamProgress?.[team];
                    if (!kpStats) return;
                    if (totals.gf === maxTournamentGF && maxTournamentGF > 0) kpStats.mostTournamentGFCount++;
                    if (totals.ga === maxTournamentGA && maxTournamentGA > 0) kpStats.mostTournamentGACount++;
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
                (groupTeamNames[groupKey]||[]).forEach(teamName=>{const ts=groupData[teamName];if(!ts||!ts.ptsSims)return; const avgPts=(ts.ptsSims.length>0&&numSims>0)?ts.ptsSims.reduce((a,b)=>a+b,0)/numSims:0; const avgWins=(ts.winsSims&&ts.winsSims.length>0&&numSims>0)?ts.winsSims.reduce((a,b)=>a+b,0)/numSims:0; const avgGF=(ts.gfSims.length>0&&numSims>0)?ts.gfSims.reduce((a,b)=>a+b,0)/numSims:0; const avgGA=(ts.gaSims.length>0&&numSims>0)?ts.gaSims.reduce((a,b)=>a+b,0)/numSims:0; const pMostGF=numSims>0?ts.mostGFCount/numSims*100:0; const pMostGA=numSims>0?ts.mostGACount/numSims*100:0; html+=`<tr><td class="px-2 py-2 whitespace-nowrap font-medium">${teamName}</td><td class="px-2 py-2">${avgPts.toFixed(2)}</td><td class="px-2 py-2">${avgWins.toFixed(2)}</td><td class="px-2 py-2">${avgGF.toFixed(2)}</td><td class="px-2 py-2">${avgGA.toFixed(2)}</td><td class="px-2 py-2 ${probToClass(pMostGF)}">${pMostGF.toFixed(1)}%</td><td class="px-2 py-2 ${probToClass(pMostGA)}">${pMostGA.toFixed(1)}%</td></tr>`;});
                html += `</tbody></table>`;
                const avgGroupGoals = (groupData.groupTotalGoalsSims&&groupData.groupTotalGoalsSims.length>0&&numSims>0)?groupData.groupTotalGoalsSims.reduce((a,b)=>a+b,0)/numSims:0;
                html += `<p class="mt-2 text-sm"><strong>Expected Total Goals in Group ${groupKey}:</strong> ${avgGroupGoals.toFixed(2)}</p>`;

                // Chart canvas for points distribution
                html += `<h4 class="font-medium text-gray-700 mt-4 mb-1">Points Distribution (all simulations):</h4>`;
                html += `<div class="chart-container mb-4" style="position:relative;height:180px;"><canvas id="chartPts_${groupKey}"></canvas></div>`;

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
                        const pR16=(stats.reachR16/numSims*100),pQF=(stats.reachQF/numSims*100),pSF=(stats.reachSF/numSims*100),pFin=(stats.reachFINAL/numSims*100),pChamp=(stats.winFINAL/numSims*100);
                        html += `<tr><td class="px-2 py-2 whitespace-nowrap font-medium">${team}</td><td class="px-2 py-2 ${probToClass(pR16)}">${pR16.toFixed(1)}%</td><td class="px-2 py-2 ${probToClass(pQF)}">${pQF.toFixed(1)}%</td><td class="px-2 py-2 ${probToClass(pSF)}">${pSF.toFixed(1)}%</td><td class="px-2 py-2 ${probToClass(pFin)}">${pFin.toFixed(1)}%</td><td class="px-2 py-2 font-semibold ${probToClass(pChamp)}">${pChamp.toFixed(1)}%</td></tr>`;
                    });
                html += `</tbody></table></div>`;
            }
            resultsContentEl.innerHTML = html || "<p>No results. Parse & run sim.</p>";
            // Render charts after DOM is set
            renderGroupCharts(aggStats, numSims);
        }

        // --- Probability Distribution Charts ---
        const _chartInstances = {};

        function renderGroupCharts(aggStats, numSims) {
            if (typeof Chart === 'undefined') return;
            const POINT_VALUES = [0, 1, 2, 3, 4, 5, 6, 7, 9];
            const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#84cc16','#f97316'];

            const sortedGroupKeys = Object.keys(aggStats).filter(k => k !== '_knockout').sort();
            sortedGroupKeys.forEach(groupKey => {
                const groupData = aggStats[groupKey];
                const teams = groupTeamNames[groupKey] || [];
                const canvasId = `chartPts_${groupKey}`;
                const canvas = document.getElementById(canvasId);
                if (!canvas) return;

                // Destroy prior chart instance if any
                if (_chartInstances[canvasId]) { _chartInstances[canvasId].destroy(); }

                const datasets = teams.map((teamName, idx) => {
                    const ptsSims = groupData[teamName]?.ptsSims || [];
                    const data = POINT_VALUES.map(pts =>
                        numSims > 0 ? (ptsSims.filter(p => p === pts).length / numSims * 100) : 0
                    );
                    return {
                        label: teamName,
                        data,
                        backgroundColor: COLORS[idx % COLORS.length] + 'cc',
                        borderColor: COLORS[idx % COLORS.length],
                        borderWidth: 1,
                    };
                });

                _chartInstances[canvasId] = new Chart(canvas, {
                    type: 'bar',
                    data: { labels: POINT_VALUES.map(String), datasets },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } },
                            tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}%` } },
                            title: { display: false }
                        },
                        scales: {
                            x: { title: { display: true, text: 'Points', font: { size: 11 } } },
                            y: { title: { display: true, text: '%', font: { size: 11 } }, beginAtZero: true }
                        }
                    }
                });
            });
        }
        
        // --- Multi-Group Tournament View ---
        function displayMultiGroupView() {
            const marginPercent = parseFloat(multiGroupMarginEl.value);
            multiGroupViewStatusEl.textContent = '';

            if (isNaN(marginPercent) || marginPercent < 0 || marginPercent > 100) {
                multiGroupViewStatusEl.textContent = 'Please enter a valid margin (0–100).';
                return;
            }
            if (currentNumSims === 0 || Object.keys(simulationAggStats).length === 0) {
                multiGroupViewStatusEl.textContent = 'Run simulation first.';
                return;
            }

            const marginDec = marginPercent / 100;
            const advPreset = getSelectedAdvancementPreset();
            const groupKeys = Object.keys(simulationAggStats).filter(k => k !== '_knockout').sort();
            const hasKnockout = Object.keys(simulationAggStats._knockout?.teamProgress || {}).length > 0 && parsedBracketMatches.length > 0;

            let html = `<h3 class="text-lg font-semibold text-indigo-600 mb-3">All Groups — Advancement Probabilities (Margin: ${marginPercent}%)</h3>`;

            // Build combined table header
            let headerCols = '<th class="px-2 py-2 text-left">Group</th><th class="px-2 py-2 text-left">Team</th><th class="px-2 py-2">P(1st)</th><th class="px-2 py-2">P(2nd)</th><th class="px-2 py-2">P(3rd)</th><th class="px-2 py-2">P(4th)</th><th class="px-2 py-2">P(Qualify)</th><th class="px-2 py-2">E(Pts)</th>';
            if (hasKnockout) headerCols += '<th class="px-2 py-2">P(Champion)</th>';

            html += `<table class="min-w-full divide-y divide-gray-200 mb-6 text-xs sm:text-sm"><thead class="bg-gray-50"><tr>${headerCols}</tr></thead><tbody class="bg-white divide-y divide-gray-200">`;

            groupKeys.forEach(gK => {
                const groupData = simulationAggStats[gK];
                const teams = groupTeamNames[gK] || [];
                // Sort teams by P(qualify) descending
                const sortedTeams = [...teams].sort((a, b) => {
                    const qa = (groupData[a]?.advanceToKnockoutCount || 0);
                    const qb = (groupData[b]?.advanceToKnockoutCount || 0);
                    return qb - qa;
                });
                sortedTeams.forEach((teamName, idx) => {
                    const ts = groupData[teamName];
                    if (!ts) return;
                    const pPos = i => currentNumSims > 0 ? (ts.posCounts[i] || 0) / currentNumSims : 0;
                    const pQual = currentNumSims > 0 ? (ts.advanceToKnockoutCount || 0) / currentNumSims : 0;
                    const avgPts = ts.ptsSims.length > 0 ? ts.ptsSims.reduce((a, b) => a + b, 0) / currentNumSims : 0;
                    const bgClass = idx % 2 === 0 ? '' : 'bg-gray-50';

                    let row = `<tr class="${bgClass}">`;
                    if (idx === 0) row = `<tr class="${bgClass} border-t-2 border-indigo-200">`;
                    row += `<td class="px-2 py-1.5 font-semibold text-indigo-600">${idx === 0 ? `Gr. ${gK}` : ''}</td>`;
                    row += `<td class="px-2 py-1.5 font-medium">${teamName}</td>`;
                    for (let i = 0; i < 4; i++) {
                        const pPct = pPos(i) * 100;
                        row += `<td class="px-2 py-1.5 text-center ${probToClass(pPct)}">${pPct.toFixed(1)}%</td>`;
                    }
                    const pQualPct = pQual * 100;
                    row += `<td class="px-2 py-1.5 text-center font-semibold ${probToClass(pQualPct)}">${pQualPct.toFixed(1)}%</td>`;
                    row += `<td class="px-2 py-1.5 text-center">${avgPts.toFixed(2)}</td>`;
                    if (hasKnockout) {
                        const kpStats = simulationAggStats._knockout?.teamProgress?.[teamName];
                        const pChamp = kpStats ? (kpStats.winFINAL || 0) / currentNumSims : 0;
                        row += `<td class="px-2 py-1.5 text-center font-semibold">${calculateOddWithMargin(pChamp, marginDec)}</td>`;
                    }
                    row += '</tr>';
                    html += row;
                });
            });

            html += '</tbody></table>';

            // Group-level summary
            html += `<h3 class="text-lg font-semibold text-indigo-600 mb-2 mt-2">Per-Group Summary</h3>`;
            html += `<table class="min-w-full divide-y divide-gray-200 text-xs sm:text-sm"><thead class="bg-gray-50"><tr><th class="px-2 py-2 text-left">Group</th><th class="px-2 py-2">Avg Goals</th><th class="px-2 py-2">P(Any 9 Pts)</th><th class="px-2 py-2">P(Any 0 Pts)</th></tr></thead><tbody class="bg-white divide-y divide-gray-200">`;
            groupKeys.forEach(gK => {
                const gd = simulationAggStats[gK];
                const avgGoals = gd.groupTotalGoalsSims && gd.groupTotalGoalsSims.length > 0 ? gd.groupTotalGoalsSims.reduce((a, b) => a + b, 0) / currentNumSims : 0;
                const p9 = currentNumSims > 0 ? (gd.anyTeam9PtsCount || 0) / currentNumSims : 0;
                const p0 = currentNumSims > 0 ? (gd.anyTeam0PtsCount || 0) / currentNumSims : 0;
                html += `<tr><td class="px-2 py-1.5 font-semibold">Gr. ${gK}</td><td class="px-2 py-1.5 text-center">${avgGoals.toFixed(2)}</td><td class="px-2 py-1.5 text-center">${(p9*100).toFixed(1)}%</td><td class="px-2 py-1.5 text-center">${(p0*100).toFixed(1)}%</td></tr>`;
            });
            html += '</tbody></table>';

            multiGroupViewContentEl.innerHTML = html;
        }

        // --- Raw Simulation Data Export ---
        function exportRawSimData() {
            if (currentNumSims === 0 || Object.keys(simulationAggStats).length === 0) {
                showInlineError(exportRawDataErrorEl, 'Run simulation first.');
                return;
            }

            const groupKeys = Object.keys(simulationAggStats).filter(k => k !== '_knockout').sort();
            const header = 'sim,group,team,pts,gf,ga,wins,position\n';
            const rows = [];

            for (let simIdx = 0; simIdx < currentNumSims; simIdx++) {
                groupKeys.forEach(gK => {
                    const teams = groupTeamNames[gK] || [];
                    teams.forEach(teamName => {
                        const ts = simulationAggStats[gK]?.[teamName];
                        if (!ts) return;
                        const pts = ts.ptsSims[simIdx] ?? '';
                        const gf = ts.gfSims[simIdx] ?? '';
                        const ga = ts.gaSims[simIdx] ?? '';
                        const wins = ts.winsSims[simIdx] ?? '';
                        const pos = ts.positionSims[simIdx] ?? '';
                        rows.push(`${simIdx + 1},${gK},"${teamName}",${pts},${gf},${ga},${wins},${pos}`);
                    });
                });
            }

            const csvContent = header + rows.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `raw_sim_data_${currentNumSims}sims.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
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

        function getGroupKeyForTeam(teamName) {
            return Object.entries(groupTeamNames || {}).find(([, teams]) => teams.includes(teamName))?.[0] || '';
        }

        function exportTeamCsv(groupKey, teamName, marginPercent, errorEl) {
            const marginDecimal = marginPercent / 100;

            if (!groupKey || !teamName) {
                showInlineError(errorEl, 'Please select a group and a team first.');
                return;
            }
            if (isNaN(marginPercent) || marginPercent < 0 || marginPercent > 100) {
                showInlineError(errorEl, 'Please enter a valid margin between 0 and 100.');
                return;
            }

            const teamData = simulationAggStats[groupKey]?.[teamName];
            if (!teamData) {
                showInlineError(errorEl, 'No simulation data found for the selected team.');
                return;
            }
            const knockoutData = simulationAggStats?._knockout?.teamProgress?.[teamName] || {};
            const teamParsedMatches = parsedMatches.filter(match => match.group === groupKey && (match.team1 === teamName || match.team2 === teamName));
            const xPtsReference = teamParsedMatches.reduce((sum, match) => {
                if (match.team1 === teamName) return sum + (3 * match.p1) + match.px;
                return sum + (3 * match.p2) + match.px;
            }, 0);
            const xGFReference = teamParsedMatches.reduce((sum, match) => sum + (match.team1 === teamName ? match.lambda1 : match.lambda2), 0);
            const xGAReference = teamParsedMatches.reduce((sum, match) => sum + (match.team1 === teamName ? match.lambda2 : match.lambda1), 0);

            const { date, time } = getCsvExportDateTime();

            const emptyRow = () => ['', '', '', '', '', '', '', '', '', '', '', '', ''];
            const rows = [];
            const addYesNoRow = (market, probability) => {
                const row = [date, time, '', market, '', calculateOddWithMargin(probability, marginDecimal), '', '', '', '', '', '', ''];
                rows.push(buildCsvRow(row));
            };
            const addLineRow = (market, line, values) => {
                const { overProb, underProb } = getLineProbabilities(values, line);
                const row = [date, time, '', market, '', '', '', '', line.toFixed(1), calculateOddWithMargin(underProb, marginDecimal), calculateOddWithMargin(overProb, marginDecimal), '', ''];
                rows.push(buildCsvRow(row));
            };
            const addRangeYesNoRow = (market, values, predicate) => {
                const probability = values.filter(predicate).length / currentNumSims;
                addYesNoRow(market, probability);
            };

            let csvContent = buildCsvRow(['Datum', 'Vreme', 'Sifra', 'Domacin', 'Gost', '1', 'X', '2', 'GR', 'U', 'O', 'Yes', 'No']);
            const matchNameRow = emptyRow();
            matchNameRow[0] = 'MATCH_NAME:World Cup 2026';
            csvContent += buildCsvRow(matchNameRow);
            const leagueRow = emptyRow();
            leagueRow[0] = `LEAGUE_NAME:${teamName}`;
            csvContent += buildCsvRow(leagueRow);
            csvContent += buildCsvRow(emptyRow());

            addYesNoRow('Pobednik Grupe', (teamData.posCounts[0] || 0) / currentNumSims);
            addYesNoRow('2. mesto u grupi', (teamData.posCounts[1] || 0) / currentNumSims);
            addYesNoRow('3. mesto u grupi', (teamData.posCounts[2] || 0) / currentNumSims);
            addYesNoRow('4. mesto u grupi', (teamData.posCounts[3] || 0) / currentNumSims);
            addYesNoRow('prolazi grupu', (teamData.advanceToKnockoutCount || 0) / currentNumSims);
            addYesNoRow('eliminacija u 1/16 finala', (knockoutData.eliminateR32 || 0) / currentNumSims);
            addYesNoRow('eliminacija u 1/8 finala', (knockoutData.eliminateR16 || 0) / currentNumSims);
            addYesNoRow('eliminacija u 1/4 finala', (knockoutData.eliminateQF || 0) / currentNumSims);
            addYesNoRow('eliminacija u 1/2 finala', (knockoutData.eliminateSF || 0) / currentNumSims);
            addYesNoRow('eliminacija u finalu', (knockoutData.runnerUpCount || 0) / currentNumSims);
            addYesNoRow('dolazi do 1/16 finala', (knockoutData.reachR32 || 0) / currentNumSims);
            addYesNoRow('dolazi do 1/8 finala', (knockoutData.reachR16 || 0) / currentNumSims);
            addYesNoRow('dolazi do 1/4 finala', (knockoutData.reachQF || 0) / currentNumSims);
            addYesNoRow('dolazi do 1/2 finala', (knockoutData.reachSF || 0) / currentNumSims);
            addYesNoRow('dolazi do finala', (knockoutData.reachFINAL || 0) / currentNumSims);

            [0, 1, 2, 3, 4, 5, 6, 7, 9].forEach(points => {
                addRangeYesNoRow(`${points} bodova u grupi`, teamData.ptsSims, value => value === points);
            });
            addRangeYesNoRow('1-3 boda u grupi', teamData.ptsSims, value => value >= 1 && value <= 3);
            addRangeYesNoRow('2-4 boda u grupi', teamData.ptsSims, value => value >= 2 && value <= 4);
            addRangeYesNoRow('4-6 bodova u grupi', teamData.ptsSims, value => value >= 4 && value <= 6);
            addRangeYesNoRow('7+ bodova u grupi', teamData.ptsSims, value => value >= 7);

            buildDynamicHalfPointLines(teamData.ptsSims, xPtsReference).forEach((line, idx) => {
                addLineRow(`osvojenih bodova u grupi${idx + 1}`, line, teamData.ptsSims);
            });
            buildDynamicHalfPointLines(teamData.gfSims, xGFReference).forEach((line, idx) => {
                addLineRow(`datih golova u grupi${idx + 1}`, line, teamData.gfSims);
            });

            addRangeYesNoRow('1-2 datih golova u grupi', teamData.gfSims, value => value >= 1 && value <= 2);
            addRangeYesNoRow('1-3 datih golova u grupi', teamData.gfSims, value => value >= 1 && value <= 3);
            addRangeYesNoRow('2-4 datih golova u grupi', teamData.gfSims, value => value >= 2 && value <= 4);
            addRangeYesNoRow('4-6 datih golova u grupi', teamData.gfSims, value => value >= 4 && value <= 6);
            addRangeYesNoRow('5-7 datih golova u grupi', teamData.gfSims, value => value >= 5 && value <= 7);

            buildDynamicHalfPointLines(teamData.gaSims, xGAReference).forEach((line, idx) => {
                addLineRow(`primljenih golova u grupi${idx + 1}`, line, teamData.gaSims);
            });

            addYesNoRow('Najvise datih golova na turniru', (knockoutData.mostTournamentGFCount || 0) / currentNumSims);
            addYesNoRow('Najvise primljenih golova na turniru', (knockoutData.mostTournamentGACount || 0) / currentNumSims);
            addYesNoRow('Daje gol na svakoj utakmici u grupi', (teamData.scoreEveryGroupGameCount || 0) / currentNumSims);
            addYesNoRow('Bez poraza u grupi', (teamData.noLossGroupCount || 0) / currentNumSims);
            addYesNoRow('Prima gol u svakoj utakmici u grupi', (teamData.concedeEveryGroupGameCount || 0) / currentNumSims);

            const winLine = findBalancedHalfPointLine(teamData.winsSims, average(teamData.winsSims));
            addLineRow('broj pobeda u grupi', winLine, teamData.winsSims);
            const drawLine = findBalancedHalfPointLine(teamData.drawsSims, average(teamData.drawsSims));
            addLineRow('broj neresenih u grupi', drawLine, teamData.drawsSims);
            const tournamentGoalsLine = findBalancedHalfPointLine(knockoutData.tournamentGfSims || [], average(knockoutData.tournamentGfSims || []));
            addLineRow('broj datih golova na turniru', tournamentGoalsLine, knockoutData.tournamentGfSims || []);

            csvContent += rows.join('');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", `team_markets_${teamName.replace(/\s+/g, '_')}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }

        function renderOverUnderRows(values, lines, marginDecimal) {
            if (!values || values.length === 0 || currentNumSims === 0) return '<p class="text-xs text-gray-500">No data.</p>';
            let html = `<table class="odds-table text-xs sm:text-sm"><thead><tr><th>Line</th><th>Over</th><th>Under</th><th>Over %</th><th>Under %</th></tr></thead><tbody>`;
            lines.forEach(line => {
                const overProb = values.filter(v => v > line).length / currentNumSims;
                const underProb = values.filter(v => v < line).length / currentNumSims;
                html += `<tr><td>${line.toFixed(1)}</td><td>${calculateOddWithMargin(overProb, marginDecimal)}</td><td>${calculateOddWithMargin(underProb, marginDecimal)}</td><td class="text-gray-400">${(overProb*100).toFixed(1)}%</td><td class="text-gray-400">${(underProb*100).toFixed(1)}%</td></tr>`;
            });
            html += '</tbody></table>';
            return html;
        }

        function getCustomOULines() {
            const raw = customOULinesEl ? customOULinesEl.value.trim() : '';
            if (!raw) return null;
            const parsed = raw.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n) && n > 0);
            return parsed.length > 0 ? parsed : null;
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

        tournamentTeamSelectEl.addEventListener('change', () => {
            generateTournamentTeamCsvButtonEl.disabled = !tournamentTeamSelectEl.value;
        });
        
        showSimulatedOddsButtonEl.addEventListener('click', () => { 
            const selectedGroupKey = simGroupSelectEl.value;
            const mainMarginPercent = parseFloat(simBookieMarginEl.value);
            const advancementPreset = getSelectedAdvancementPreset();
            
            simulatedOddsStatusEl.textContent = ""; 
            calculatedOddsResultContentEl.innerHTML = "";

            if (!selectedGroupKey) { simulatedOddsStatusEl.textContent = "Select group."; return; }
            if (isNaN(mainMarginPercent) || mainMarginPercent < 0 || mainMarginPercent > 100) {
                simulatedOddsStatusEl.textContent = "Please enter a valid margin between 0 and 100.";
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

                    // Use custom lines if specified, otherwise auto-compute
                    const customLines = getCustomOULines();
                    let lines;
                    if (customLines) {
                        lines = customLines;
                    } else {
                        const centerLine = Math.round(avg) + 0.5;
                        lines = [centerLine - 1, centerLine, centerLine + 1].filter(l => l > 0);
                    }

                    let ouHtml = `<table class="w-full text-center"><thead><tr class="text-gray-500"><th>Line</th><th>Over</th><th>Under</th><th class="text-gray-400 text-xs">Over%</th><th class="text-gray-400 text-xs">Under%</th></tr></thead><tbody>`;

                    lines.forEach(line => {
                         const overCount = groupData[dataKey].filter(val => val > line).length;
                         const underCount = groupData[dataKey].filter(val => val < line).length;
                         const probOver = overCount / currentNumSims;
                         const probUnder = underCount / currentNumSims;
                         const oddOver = calculateOddWithMargin(probOver, ouMarginDecimal);
                         const oddUnder = calculateOddWithMargin(probUnder, ouMarginDecimal);
                         ouHtml += `<tr><td>${line.toFixed(1)}</td><td>${oddOver}</td><td>${oddUnder}</td><td class="text-gray-400 text-xs">${(probOver*100).toFixed(1)}%</td><td class="text-gray-400 text-xs">${(probUnder*100).toFixed(1)}%</td></tr>`;
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

            if (isNaN(marginPercent) || marginPercent < 0 || marginPercent > 100) { tournamentTeamOddsStatusEl.textContent = 'Enter a valid margin between 0 and 100.'; return; }
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
            if (isNaN(marginPercent) || marginPercent < 0 || marginPercent > 100) { customProbAndOddResultAreaEl.innerHTML = '<p class="text-red-500">Valid margin (0–100) needed.</p>'; return; }
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
            matchDataEl.value = ""; numSimulationsEl.value = "10000"; numSimulationsPresetEl.value = "10000"; statusAreaEl.innerHTML = ""; resultsContentEl.innerHTML = '<span class="text-gray-400">Results will appear here...</span>';
            eloDataEl.value = "";
            bracketDataEl.value = "";
            parsedMatches=[]; parsedBracketMatches=[]; teamEloRatings={}; allTeams.clear(); groupedMatches={}; groupTeamNames={}; simulationAggStats={}; currentNumSims=0;
            lockedScenarios = {};
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
            generateTeamCsvButtonEl.disabled = true;
            generateTournamentTeamCsvButtonEl.disabled = true;
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
            scenarioLockSectionEl.classList.add('hidden');
            exportRawDataSectionEl.classList.add('hidden');
            multiGroupViewContentEl.innerHTML = 'Run simulation first, then click "Show Multi-Group Overview".';
            multiGroupViewStatusEl.textContent = '';
            syncSimulationPresetFromInput();
            renderLambdaView();
        });

        // --- Initial Sample Data ---
        inputModeEl.value = 'hybrid';
        matchDataEl.value = `A	Mexico	vs	South Africa	1.52	4.07	5.99	1.87	1.92
A	South Korea	vs	Czech Republic	2.58	3.18	2.70	1.67	2.20
B	Canada	vs	Bosnia and Herzegovina	2.25	3.40	3.02	1.73	2.10
B	Qatar	vs	Switzerland	8.50	5.65	1.30	2.23	1.62
C	Haiti	vs	Scotland	6.58	5.20	1.38	2.07	1.74
C	Brazil	vs	Morocco	1.60	3.75	5.70	1.92	1.87
D	USA	vs	Paraguay	1.90	3.70	3.70	1.81	1.99
D	Australia	vs	Turkey	4.75	3.80	1.62	1.73	2.10
E	Germany	vs	Curaçao	1.02	21.00	41.00	5.00	1.17
E	Ivory Coast	vs	Ecuador	3.20	2.77	2.46	1.51	2.50
F	Netherlands	vs	Japan	2.02	3.44	3.61	1.90	1.90
F	Sweden	vs	Tunisia	1.83	3.50	3.80	1.67	2.20
G	Belgium	vs	Egypt	1.52	4.42	5.40	2.08	1.73
G	Iran	vs	New Zealand	1.77	3.60	4.25	1.73	2.10
H	Spain	vs	Cape Verde	1.06	11.00	23.00	3.40	1.33
H	Saudi Arabia	vs	Uruguay	5.40	3.85	1.60	1.85	1.95
I	France	vs	Senegal	1.40	4.68	7.12	2.10	1.72
I	Iraq	vs	Norway	6.00	4.50	1.40	2.15	1.65
J	Argentina	vs	Algeria	1.42	4.22	7.85	1.91	1.88
J	Austria	vs	Jordan	1.35	5.06	7.75	2.25	1.62
K	Portugal	vs	DR Congo	1.33	4.75	8.00	2.30	1.60
K	Uzbekistan	vs	Colombia	7.00	4.12	1.46	1.93	1.87
L	England	vs	Croatia	1.62	4.03	4.96	1.87	1.92
L	Ghana	vs	Panama	2.03	3.79	3.28	1.80	2.00
A	Czech Republic	vs	South Africa	1.83	4.35	4.44	2.15	1.65
A	Mexico	vs	South Korea	1.98	4.17	3.92	2.20	1.62
B	Switzerland	vs	Bosnia and Herzegovina	1.47	5.56	7.14	1.85	1.95
B	Canada	vs	Qatar	1.53	5.26	6.45	1.90	1.90
C	Brazil	vs	Haiti	1.04	40.00	100.00	1.35	3.15
C	Scotland	vs	Morocco	4.00	4.17	1.96	2.20	1.62
D	Turkey	vs	Paraguay	1.86	4.31	4.35	2.15	1.65
D	USA	vs	Australia	1.53	5.26	6.45	1.90	1.90
E	Germany	vs	Ivory Coast	1.35	6.45	9.52	1.75	2.05
E	Ecuador	vs	Curaçao	1.14	12.50	25.00	1.55	2.45
F	Netherlands	vs	Sweden	1.41	5.88	8.33	1.80	2.00
F	Tunisia	vs	Japan	9.09	6.25	1.37	1.75	2.05
G	Belgium	vs	Iran	1.40	6.06	8.33	1.80	2.00
G	New Zealand	vs	Egypt	5.56	5.00	1.61	2.00	1.75
H	Spain	vs	Saudi Arabia	1.04	33.33	100.00	1.35	3.15
H	Uruguay	vs	Cape Verde	1.23	8.33	14.30	1.65	2.20
I	Norway	vs	Senegal	1.65	4.76	5.41	2.05	1.70
I	France	vs	Iraq	1.05	28.60	100.00	1.40	2.90
J	Argentina	vs	Austria	1.20	9.09	18.20	1.60	2.30
J	Jordan	vs	Algeria	6.06	5.13	1.56	1.95	1.85
K	Portugal	vs	Uzbekistan	1.08	20.00	50.00	1.45	2.70
K	Colombia	vs	DR Congo	1.18	9.52	20.00	1.60	2.30
L	England	vs	Ghana	1.08	18.20	50.00	1.45	2.70
L	Panama	vs	Croatia	10.00	6.67	1.33	1.70	2.10
A	South Africa	vs	South Korea	4.76	4.44	1.77	2.10	1.70
A	Czech Republic	vs	Mexico	4.35	4.26	1.87	2.15	1.65
B	Switzerland	vs	Canada	1.82	4.35	4.55	2.10	1.70
B	Bosnia and Herzegovina	vs	Qatar	1.92	4.26	4.08	2.15	1.65
C	Scotland	vs	Brazil	15.40	9.09	1.21	1.65	2.20
C	Morocco	vs	Haiti	1.16	11.10	20.00	1.55	2.45
D	Australia	vs	Paraguay	3.23	4.00	2.27	2.25	1.60
D	Turkey	vs	USA	3.03	3.92	2.41	2.30	1.55
E	Ecuador	vs	Germany	5.88	5.13	1.57	1.95	1.85
E	Curaçao	vs	Ivory Coast	14.30	8.33	1.23	1.65	2.20
F	Tunisia	vs	Netherlands	16.70	9.09	1.20	1.60	2.30
F	Japan	vs	Sweden	1.82	4.35	4.55	2.10	1.70
G	New Zealand	vs	Belgium	16.70	9.09	1.20	1.60	2.30
G	Egypt	vs	Iran	2.27	4.00	3.23	2.25	1.60
H	Uruguay	vs	Spain	16.70	9.09	1.20	1.60	2.30
H	Cape Verde	vs	Saudi Arabia	3.45	4.08	2.15	2.20	1.62
I	Norway	vs	France	6.45	5.26	1.53	1.90	1.90
I	Senegal	vs	Iraq	1.42	5.88	8.00	1.80	2.00
J	Jordan	vs	Argentina	100.00	33.33	1.04	1.35	3.15
J	Algeria	vs	Austria	4.00	4.17	1.96	2.20	1.62
K	Colombia	vs	Portugal	4.35	4.31	1.86	2.15	1.65
K	DR Congo	vs	Uzbekistan	2.47	3.92	2.94	2.35	1.50
L	Panama	vs	England	66.70	28.60	1.05	1.40	2.90
L	Croatia	vs	Ghana	1.53	5.26	6.45	1.90	1.90`;
        eloDataEl.value = `GROUP,TEAM,ELO_RATING
A,South Korea,1844
A,Czech Republic,1731
A,Mexico,1715
A,South Africa,1602
B,Switzerland,1897
B,Canada,1744
B,Bosnia and Herzegovina,1572
B,Qatar,1540
C,Brazil,1970
C,Morocco,1785
C,Scotland,1790
C,Haiti,1420
D,USA,1812
D,Turkey,1880
D,Australia,1733
D,Paraguay,1722
E,Germany,1910
E,Ecuador,1933
E,Ivory Coast,1720
E,Curaçao,1355
F,Netherlands,1959
F,Sweden,1660
F,Japan,1825
F,Tunisia,1615
G,Belgium,1850
G,Iran,1810
G,Egypt,1748
G,New Zealand,1555
H,Spain,2172
H,Uruguay,1895
H,Saudi Arabia,1588
H,Cape Verde,1530
I,France,2062
I,Norway,1922
I,Senegal,1792
I,Iraq,1560
J,Argentina,2113
J,Austria,1818
J,Algeria,1735
J,Jordan,1525
K,Portugal,1976
K,Colombia,1975
K,DR Congo,1515
K,Uzbekistan,1645
L,England,2042
L,Croatia,1932
L,Ghana,1610
L,Panama,1655`;
        bracketDataEl.value = `ROUND,MATCH_ID,TEAM_A,vs,TEAM_B
R32,Match 74,Winner Group E,vs,3rd Group A/B/C/D/F
R32,Match 77,Winner Group I,vs,3rd Group C/D/F/G/H
R32,Match 73,Runner-up Group A,vs,Runner-up Group B
R32,Match 75,Winner Group F,vs,Runner-up Group C
R32,Match 83,Runner-up Group K,vs,Runner-up Group L
R32,Match 84,Winner Group H,vs,Runner-up Group J
R32,Match 81,Winner Group D,vs,3rd Group B/E/F/I/J
R32,Match 82,Winner Group G,vs,3rd Group A/E/H/I/J
R32,Match 76,Winner Group C,vs,Runner-up Group F
R32,Match 78,Runner-up Group E,vs,Runner-up Group I
R32,Match 79,Winner Group A,vs,3rd Group C/E/F/H/I
R32,Match 80,Winner Group L,vs,3rd Group E/H/I/J/K
R32,Match 86,Winner Group J,vs,Runner-up Group H
R32,Match 88,Runner-up Group D,vs,Runner-up Group G
R32,Match 85,Winner Group B,vs,3rd Group E/F/G/I/J
R32,Match 87,Winner Group K,vs,3rd Group D/E/I/J/L
R16,Match 89,Winner Match 74,vs,Winner Match 77
R16,Match 90,Winner Match 73,vs,Winner Match 75
R16,Match 93,Winner Match 83,vs,Winner Match 84
R16,Match 94,Winner Match 81,vs,Winner Match 82
R16,Match 91,Winner Match 76,vs,Winner Match 78
R16,Match 92,Winner Match 79,vs,Winner Match 80
R16,Match 95,Winner Match 86,vs,Winner Match 88
R16,Match 96,Winner Match 85,vs,Winner Match 87
QF,Match 97,Winner Match 89,vs,Winner Match 90
QF,Match 98,Winner Match 93,vs,Winner Match 94
QF,Match 99,Winner Match 91,vs,Winner Match 92
QF,Match 100,Winner Match 95,vs,Winner Match 96
SF,Match 101,Winner Match 97,vs,Winner Match 98
SF,Match 102,Winner Match 99,vs,Winner Match 100
3RD,Match 103,Loser Match 101,vs,Loser Match 102
FINAL,Match 104,Winner Match 101,vs,Winner Match 102`;

        populateTieBreakPresets();
        populateAdvancementPresets();
        updateInputModeUi();
        populateTournamentTeamSelect();
        simCustomOperatorEl.addEventListener('change', () => { 
            if (simCustomOperatorEl.value === 'between') simCustomValue2El.classList.remove('hidden');
            else simCustomValue2El.classList.add('hidden');
        });

        generateTeamCsvButtonEl.addEventListener('click', () => {
            exportTeamCsv(simGroupSelectEl.value, simTeamSelectEl.value, parseFloat(simBookieMarginEl.value), generateTeamCsvErrorEl);
        });

        generateTournamentTeamCsvButtonEl.addEventListener('click', () => {
            const teamName = tournamentTeamSelectEl.value;
            exportTeamCsv(getGroupKeyForTeam(teamName), teamName, parseFloat(tournamentBookieMarginEl.value), generateTournamentTeamCsvErrorEl);
        });

        generateGroupCsvButtonEl.addEventListener('click', () => {
            const groupKey = simGroupSelectEl.value;
            const marginPercent = parseFloat(simBookieMarginEl.value);
            const marginDecimal = marginPercent / 100;

            if (!groupKey) {
                showInlineError(generateGroupCsvErrorEl, 'Please select a group first.');
                return;
            }
            if (isNaN(marginPercent) || marginPercent < 0 || marginPercent > 100) {
                showInlineError(generateGroupCsvErrorEl, 'Please enter a valid margin between 0 and 100.');
                return;
            }
            const groupData = simulationAggStats[groupKey];
            const teams = groupTeamNames[groupKey] || [];
            if (!groupData || teams.length === 0) {
                showInlineError(generateGroupCsvErrorEl, 'No simulation data found for the selected group.');
                return;
            }
            const { date, time } = getCsvExportDateTime();

            const emptyRow = () => ['', '', '', '', '', '', '', '', '', '', '', '', ''];
            const rows = [];
            const addYesNoRow = (market, probability) => {
                const row = [date, time, '', market, '', calculateOddWithMargin(probability, marginDecimal), '', '', '', '', '', '', ''];
                rows.push(buildCsvRow(row));
            };
            const addLineRow = (market, line, values) => {
                const { overProb, underProb } = getLineProbabilities(values, line);
                const row = [date, time, '', market, '', '', '', '', line.toFixed(1), calculateOddWithMargin(underProb, marginDecimal), calculateOddWithMargin(overProb, marginDecimal), '', ''];
                rows.push(buildCsvRow(row));
            };

            let csvContent = buildCsvRow(['Datum', 'Vreme', 'Sifra', 'Domacin', 'Gost', '1', 'X', '2', 'GR', 'U', 'O', 'Yes', 'No']);
            const matchNameRow = emptyRow();
            matchNameRow[0] = 'MATCH_NAME:World Cup 2026';
            csvContent += buildCsvRow(matchNameRow);
            const leagueRow = emptyRow();
            leagueRow[0] = `LEAGUE_NAME:Grupa ${groupKey}`;
            csvContent += buildCsvRow(leagueRow);
            csvContent += buildCsvRow(emptyRow());

            teams.forEach(team => {
                const prob = (groupData[team]?.posCounts?.[0] || 0) / currentNumSims;
                addYesNoRow(`${team} - pobednik grupe`, prob);
            });

            const allSF = Object.entries(groupData.straightForecasts || {}).sort(([, a], [, b]) => b - a);
            allSF.forEach(([key, count]) => {
                const marketName = key.replace('(1st)-', '/').replace('(2nd)', '');
                addYesNoRow(`Tacan redosled 1-2: ${marketName}`, count / currentNumSims);
            });

            const allAD = Object.entries(groupData.advancingDoubles || {}).sort(([, a], [, b]) => b - a);
            allAD.forEach(([key, count]) => {
                addYesNoRow(`Prva dva bilo kojim redom: ${key.replace('&', ' / ')}`, count / currentNumSims);
            });

            addYesNoRow('Bilo koji tim osvaja 9 bodova', (groupData.anyTeam9PtsCount || 0) / currentNumSims);
            addYesNoRow('Bilo koji tim osvaja 0 bodova', (groupData.anyTeam0PtsCount || 0) / currentNumSims);
            addYesNoRow('Treceplasirani tim ide dalje', (groupData.thirdPlaceAdvancesCount || 0) / currentNumSims);

            const totalGoalsLines = buildDynamicHalfPointLines(groupData.groupTotalGoalsSims || [], average(groupData.groupTotalGoalsSims || []));
            ['ukupno golova u grupi (balans)', 'ukupno golova u grupi (+1)', 'ukupno golova u grupi (-1)'].forEach((label, idx) => {
                const line = totalGoalsLines[idx];
                addLineRow(label, line, groupData.groupTotalGoalsSims || []);
            });

            const totalDrawsLine = findBalancedHalfPointLine(groupData.groupTotalDrawsSims || [], average(groupData.groupTotalDrawsSims || []));
            addLineRow('ukupno neresenih meceva u grupi', totalDrawsLine, groupData.groupTotalDrawsSims || []);

            const firstPtsSims = groupData.firstPlacePtsSims || [];
            if (firstPtsSims.length > 0) {
                [4.5, 6.5, 7.5].forEach(line => addLineRow(`broj bodova prvoplasiranog tima${line === 4.5 ? '1' : line === 6.5 ? '2' : '3'}`, line, firstPtsSims));
            }

            const fourthPtsSims = groupData.fourthPlacePtsSims || [];
            if (fourthPtsSims.length > 0) {
                [0.5, 1.5, 2.5].forEach(line => addLineRow(`broj bodova poslednjeplasiranog tima${line === 0.5 ? '1' : line === 1.5 ? '2' : '3'}`, line, fourthPtsSims));
            }

            teams.forEach(team => {
                const probMostGoals = (groupData[team]?.mostGFCount || 0) / currentNumSims;
                addYesNoRow(`${team} - najefikasniji tim u grupi`, probMostGoals);
            });

            csvContent += rows.join('');

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

        // --- New Feature: Scenario Lock clear button ---
        clearLocksBtnEl.addEventListener('click', () => {
            lockedScenarios = {};
            scenarioLockTableBodyEl.querySelectorAll('.scenario-lock-score-input').forEach(input => { input.value = ''; });
        });

        // --- New Feature: Export Raw Simulation Data ---
        exportRawDataBtnEl.addEventListener('click', exportRawSimData);

        // --- New Feature: Multi-Group View ---
        showMultiGroupViewBtnEl.addEventListener('click', displayMultiGroupView);

        // --- New Feature: Language Toggle ---
        langToggleBtnEl.addEventListener('click', () => {
            currentLanguage = currentLanguage === 'en' ? 'sr' : 'en';
            const enPill = langToggleBtnEl.querySelector('[data-lang="en"]');
            const srPill = langToggleBtnEl.querySelector('[data-lang="sr"]');
            if (enPill) enPill.className = `lang-pill ${currentLanguage === 'en' ? 'lang-pill-active' : 'lang-pill-inactive'}`;
            if (srPill) srPill.className = `lang-pill ${currentLanguage === 'sr' ? 'lang-pill-active' : 'lang-pill-inactive'}`;
            langToggleBtnEl.title = `Current language: ${currentLanguage.toUpperCase()}. Click to switch.`;
        });
