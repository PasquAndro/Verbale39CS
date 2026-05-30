// js/parte2/scrutinio_sindaco.js

document.addEventListener("DOMContentLoaded", () => {
    // Inizializza l'ascolto sul pulsante "Aggiungi Candidato Sindaco"
    const btnAggiungiSindaco = document.getElementById("btn-aggiungi-sindaco");
    if (btnAggiungiSindaco) {
        btnAggiungiSindaco.addEventListener("click", () => {
            creaNuovaRigaSindacoInTabella("", "", 0);
            salvaStatoSindacoNelModelloGlobale();
        });
    }

    // Gestione del ricaricamento da LocalStorage o file esterno
    document.addEventListener("verbale:ricaricato", () => {
        ricostruisciSindaciDaStatoSalvato();
    });

    // Intercetta le modifiche sul DOM del blocco schede non valide o della tabella sindaci
    const tbody = document.getElementById("tabella-sindaco-body");
    if (tbody) {
        tbody.addEventListener("input", () => {
            eseguiCalcoliScrutinioSindaco();
            salvaStatoSindacoNelModelloGlobale();
        });
    }

    const inputsNonValide = document.querySelectorAll("#scrut-bianche, #scrut-nulle, #scrut-solo-nulli");
    inputsNonValide.forEach(input => {
        if (input) {
            input.addEventListener("input", () => {
                eseguiCalcoliScrutinioSindaco();
                salvaStatoSindacoNelModelloGlobale();
            });
        }
    });

    setTimeout(ricostruisciSindaciDaStatoSalvato, 400);
});

/**
 * Crea una riga editabile per il candidato Sindaco nella tabella
 */
function creaNuovaRigaSindacoInTabella(nomeSindaco = "", listeCollegate = "", votiOttenuti = 0) {
    const tbody = document.getElementById("tabella-sindaco-body");
    if (!tbody) return;

    const numeroCandidato = tbody.children.length + 1;

    const row = document.createElement("tr");
    row.className = "riga-sindaco-dinamica";
    
    row.innerHTML = `
        <td style="text-align:center; font-weight:bold; color:#1e3d59;">${numeroCandidato}</td>
        <td>
            <input type="text" class="input-nome-sindaco" placeholder="Es. Mario Rossi" value="${nomeSindaco}" style="font-weight:bold; border-bottom:1px solid #ccc !important;">
        </td>
        <td>
            <input type="text" class="input-liste-collegate" placeholder="Es. Liste 1, 4, 5" value="${listeCollegate}" style="border-bottom:1px solid #ccc !important;">
        </td>
        <td>
            <input type="number" class="voti-sindaco-input" value="${votiOttenuti}" min="0" style="text-align:right; font-family:monospace; font-weight:bold;">
        </td>
        <td class="no-print" style="text-align:center;">
            <button type="button" class="btn-cancella-sindaco" style="background:#e74c3c; color:white; padding:3px 8px; border-radius:3px; font-size:0.8rem; font-weight:bold; cursor:pointer;">❌ Rimuovi</button>
        </td>
    `;

    // Gestione rimozione riga candidato
    row.querySelector(".btn-cancella-sindaco").addEventListener("click", () => {
        row.remove();
        riordinaNumerazioneProgressivaSindaci();
        eseguiCalcoliScrutinioSindaco();
        salvaStatoSindacoNelModelloGlobale();
    });

    tbody.appendChild(row);
    eseguiCalcoliScrutinioSindaco();
}

function riordinaNumerazioneProgressivaSindaci() {
    const righe = document.querySelectorAll("#tabella-sindaco-body .riga-sindaco-dinamica");
    righe.forEach((riga, index) => {
        riga.children[0].textContent = index + 1;
    });
}

/**
 * Esegue l'algoritmo di calcolo dinamico e la quadratura con il paragrafo § 23
 */
function eseguiCalcoliScrutinioSindaco() {
    const righe = document.querySelectorAll("#tabella-sindaco-body .riga-sindaco-dinamica");
    let totaleVotiSindaco = 0;

    righe.forEach(riga => {
        const inputVoti = riga.querySelector(".voti-sindaco-input");
        totaleVotiSindaco += inputVoti ? (parseFloat(inputVoti.value) || 0) : 0;
    });
    
    if (document.getElementById("totale-voti-sindaco")) {
        document.getElementById("totale-voti-sindaco").textContent = totaleVotiSindaco;
    }

    // Recupero dati schede non valide
    const elB = document.getElementById("scrut-bianche");
    const elN = document.getElementById("scrut-nulle");
    const elSN = document.getElementById("scrut-solo-nulli");

    const bianche = elB ? (parseFloat(elB.value) || 0) : 0;
    const nulle = elN ? (parseFloat(elN.value) || 0) : 0;
    const soloNulli = elSN ? (parseFloat(elSN.value) || 0) : 0;

    // Calcolo Totale Generale Schede Scrutinate (§ 38)
    const totaleSchedeScrutinate = totaleVotiSindaco + bianche + nulle + soloNulli;

    // Aggiornamento Prospetto Riepilogativo a Schermo
    if (document.getElementById("quad-voti-validi")) document.getElementById("quad-voti-validi").textContent = totaleVotiSindaco;
    if (document.getElementById("quad-bianche")) document.getElementById("quad-bianche").textContent = bianche;
    if (document.getElementById("quad-nulle")) document.getElementById("quad-nulle").textContent = nulle;
    if (document.getElementById("quad-solo-nulli")) document.getElementById("quad-solo-nulli").textContent = soloNulli;
    if (document.getElementById("quad-totale-scrutinate")) document.getElementById("quad-totale-scrutinate").textContent = totaleSchedeScrutinate;

    // Verifica quadratura con i votanti reali registrati del § 23
    let totaleVotantiSezione = 0;
    if (typeof VERBALE_DATA !== 'undefined' && VERBALE_DATA.parte2.p21_p22_p23_calcolati) {
        totaleVotantiSezione = VERBALE_DATA.parte2.p21_p22_p23_calcolati.totale_votanti_p23 || 0;
    } else {
        const txtTotVotanti = document.getElementById("p23-totale-votanti");
        totaleVotantiSezione = txtTotVotanti ? (parseFloat(txtTotVotanti.textContent) || 0) : 0;
    }

    const pannello = document.getElementById("pannello-stato-quadratura");
    const icona = document.getElementById("quad-icona");
    const messaggio = document.getElementById("quad-messaggio");
    const diffText = document.getElementById("quad-differenza");

    if (pannello) {
        if (totaleVotantiSezione === 0 && totaleSchedeScrutinate === 0) {
            pannello.style.backgroundColor = "#ffffff";
            pannello.style.borderColor = "#ccc";
            pannello.style.color = "#7f8c8d";
            icona.textContent = "⚪";
            messaggio.textContent = "In attesa dell'inserimento dei dati di spoglio...";
            diffText.textContent = "";
        } else if (totaleSchedeScrutinate === totaleVotantiSezione) {
            pannello.style.backgroundColor = "#e8f5e9";
            pannello.style.borderColor = "#2e7d32";
            pannello.style.color = "#2e7d32";
            icona.textContent = "✅";
            messaggio.textContent = "QUADRATURA PERFETTA!";
            diffText.textContent = `Schede scrutinate (${totaleSchedeScrutinate}) corrispondono esattamente ai votanti (${totaleVotantiSezione}).`;
        } else {
            const differenza = totaleVotantiSezione - totaleSchedeScrutinate;
            pannello.style.backgroundColor = "#ffebee";
            pannello.style.borderColor = "#c62828";
            pannello.style.color = "#c62828";
            icona.textContent = "❌";
            messaggio.textContent = "DISCORDANZA DATI!";
            if (differenza > 0) {
                diffText.textContent = `Mancano all'appello ${differenza} schede rispetto ai votanti registrati (${totaleVotantiSezione}).`;
            } else {
                diffText.textContent = `Ci sono ${Math.abs(differenza)} schede in PIÙ rispetto ai votanti registrati (${totaleVotantiSezione}).`;
            }
        }
    }
}

/**
 * Salva i candidati scritti a mano nello stato globale per consentire l'esportazione
 */
function salvaStatoSindacoNelModelloGlobale() {
    if (typeof VERBALE_DATA === 'undefined') return;

    const righe = document.querySelectorAll("#tabella-sindaco-body .riga-sindaco-dinamica");
    const elencoSindaciDaSalvare = [];

    righe.forEach((riga, index) => {
        const nome = riga.querySelector(".input-nome-sindaco").value;
        const liste = riga.querySelector(".input-liste-collegate").value;
        const voti = parseFloat(riga.querySelector(".voti-sindaco-input").value) || 0;

        elencoSindaciDaSalvare.push({
            numero: index + 1,
            nome: nome,
            liste: liste,
            voti: voti
        });
    });

    if (!VERBALE_DATA.parte2.scrutinio) VERBALE_DATA.parte2.scrutinio = {};
    VERBALE_DATA.parte2.scrutinio.sindaci_dinamici = elencoSindaciDaSalvare;
    
    // Aggiornamento parametri di quadratura
    const txtTotSindaci = document.getElementById("totale-voti-sindaco");
    const txtTotScrutinate = document.getElementById("quad-totale-scrutinate");
    
    VERBALE_DATA.parte2.scrutinio.sindaco_totale_validi = txtTotSindaci ? (parseFloat(txtTotSindaci.textContent) || 0) : 0;
    VERBALE_DATA.parte2.scrutinio.totale_schede_scrutinate = txtTotScrutinate ? (parseFloat(txtTotScrutinate.textContent) || 0) : 0;

    localStorage.setItem("verbale_elettorale_mod39cs", JSON.stringify(VERBALE_DATA));
}

/**
 * Ricostruisce le righe dei candidati Sindaco dal file di salvataggio JSON o dal browser
 */
function ricostruisciSindaciDaStatoSalvato() {
    if (typeof VERBALE_DATA === 'undefined' || !VERBALE_DATA.parte2.scrutinio || !VERBALE_DATA.parte2.scrutinio.sindaci_dinamici) return;

    const tbody = document.getElementById("tabella-sindaco-body");
    if (!tbody) return;

    tbody.innerHTML = ""; // Resetta la tabella corrente

    const sindaciSalvati = VERBALE_DATA.parte2.scrutinio.sindaci_dinamici;
    if (sindaciSalvati.length > 0) {
        sindaciSalvati.forEach(sindaco => {
            creaNuovaRigaSindacoInTabella(sindaco.nome, sindaco.liste, sindaco.voti);
        });
    }
    eseguiCalcoliScrutinioSindaco();
}