// js/parte2/scrutinio_sindaco.js

document.addEventListener("DOMContentLoaded", () => {
    const btnAggiungiSindaco = document.getElementById("btn-aggiungi-sindaco");
    if (btnAggiungiSindaco) {
        btnAggiungiSindaco.addEventListener("click", () => {
            creaNuovaRigaSindacoDinamica("", "", 0, 0, 0);
            salvaStatoSindacoNelModelloGlobale();
        });
    }

    // Gestione del cambio della tipologia di comune Siciliano
    const selectTipoComune = document.getElementById("cfg-tipo-comune");
    if (selectTipoComune) {
        selectTipoComune.addEventListener("change", () => {
            adeguaInterfacciaElettoraleSicilia();
            sincronizzaTabelleECalcolaTotali();
        });
    }

    document.addEventListener("verbale:ricaricato", () => {
        ricostruisciSindaciDaStatoSalvato();
        adeguaInterfacciaElettoraleSicilia();
    });

    const containerSez2 = document.getElementById("sez-parte2");
    if (containerSez2) {
        containerSez2.addEventListener("input", (e) => {
            sincronizzaTabelleECalcolaTotali();
            salvaStatoSindacoNelModelloGlobale();
        });
    }

    setTimeout(() => {
        ricostruisciSindaciDaStatoSalvato();
        adeguaInterfacciaElettoraleSicilia();
    }, 400);
});

function adeguaInterfacciaElettoraleSicilia() {
    const selectTipoComune = document.getElementById("cfg-tipo-comune");
    if (!selectTipoComune) return;

    const tipo = selectTipoComune.value; 
    const inputsSoloSindaco = document.querySelectorAll(".inp-sindaco-voti-solo");
    const thSolo = document.getElementById("th-sindaco-solo");
    const rigaBisSolo = document.getElementById("riga-bis-solo-sindaco");

    if (tipo === "inferiore") {
        if (thSolo) thSolo.style.opacity = "0.4";
        if (rigaBisSolo) rigaBisSolo.style.display = "none";
        inputsSoloSindaco.forEach(input => {
            input.value = 0;
            input.disabled = true;
            input.style.backgroundColor = "#eee";
            input.style.cursor = "not-allowed";
        });
    } else {
        if (thSolo) thSolo.style.opacity = "1";
        if (rigaBisSolo) rigaBisSolo.style.display = "";
        inputsSoloSindaco.forEach(input => {
            input.disabled = false;
            input.style.backgroundColor = "";
            input.style.cursor = "";
        });
    }
}

function creaNuovaRigaSindacoDinamica(nome = "", liste = "", votiValidi = 0, soloSindaco = 0, contestatiNonAttr = 0) {
    const tBodyA = document.getElementById("tabella-sindaco-a-body");
    const tBodyB = document.getElementById("tabella-sindaco-b-body");
    if (!tBodyA || !tBodyB) return;

    const idProgressivo = tBodyA.children.length + 1;

    const rowA = document.createElement("tr");
    rowA.className = "riga-sindaco-dinamica-a";
    rowA.setAttribute("data-id", idProgressivo);
    rowA.innerHTML = `
        <td style="text-align:center; font-weight:bold; color:#1e3d59;">${idProgressivo}</td>
        <td><input type="text" class="inp-sindaco-nome" placeholder="Nome Candidato" value="${nome}" style="font-weight:bold; border-bottom:1px solid #ccc !important;"></td>
        <td><input type="text" class="inp-sindaco-liste" placeholder="Es. Liste 2, 4" value="${liste}" style="border-bottom:1px solid #ccc !important;"></td>
        <td><input type="number" class="inp-sindaco-voti-validi" value="${votiValidi}" min="0" style="text-align:right; font-family:monospace; font-weight:bold;"></td>
        <td><input type="number" class="inp-sindaco-voti-solo" value="${soloSindaco}" min="0" style="text-align:right; font-family:monospace;"></td>
        <td class="no-print" style="text-align:center;"><button type="button" class="btn-del-sindaco" style="background:#e74c3c; color:white; padding:3px 8px; border-radius:3px; font-size:0.8rem; font-weight:bold;">❌</button></td>
    `;

    const rowB = document.createElement("tr");
    rowB.className = "riga-sindaco-dinamica-b";
    rowB.setAttribute("data-id", idProgressivo);
    rowB.innerHTML = `
        <td style="text-align:center; font-weight:bold;">${idProgressivo}</td>
        <td class="lbl-sindaco-specchio-nome" style="font-weight:bold; color:#2c3e50;">${nome || "Candidato " + idProgressivo}</td>
        <td style="text-align:right; font-family:monospace; font-weight:bold; background-color:#fafdfa;" class="txt-sindaco-specchio-validi">${votiValidi}</td>
        <td><input type="number" class="inp-sindaco-contestati-no" value="${contestatiNonAttr}" min="0" style="text-align:right; font-family:monospace; font-weight:bold;"></td>
    `;

    rowA.querySelector(".btn-del-sindaco").addEventListener("click", () => {
        rowA.remove();
        rowB.remove();
        riordinaProgressiviSindaci();
        sincronizzaTabelleECalcolaTotali();
        salvaStatoSindacoNelModelloGlobale();
    });

    tBodyA.appendChild(rowA);
    tBodyB.appendChild(rowB);
    
    adeguaInterfacciaElettoraleSicilia();
    sincronizzaTabelleECalcolaTotali();
}

function riordinaProgressiviSindaci() {
    const righeA = document.querySelectorAll("#tabella-sindaco-a-body .riga-sindaco-dinamica-a");
    const righeB = document.querySelectorAll("#tabella-sindaco-b-body .riga-sindaco-dinamica-b");
    
    righeA.forEach((riga, i) => {
        const nuovoId = i + 1;
        riga.setAttribute("data-id", nuovoId);
        riga.children[0].textContent = nuovoId;
    });
    righeB.forEach((riga, i) => {
        const nuovoId = i + 1;
        riga.setAttribute("data-id", nuovoId);
        riga.children[0].textContent = nuevoId;
    });
}

window.sincronizzaTabelleECalcolaTotali = function() {
    const righeA = document.querySelectorAll("#tabella-sindaco-a-body .riga-sindaco-dinamica-a");
    const selectTipoComune = document.getElementById("cfg-tipo-comune");
    const isComunePiccolo = selectTipoComune ? (selectTipoComune.value === "inferiore") : false;
    
    let sommaVotiValidiA = 0;
    let sommaContestatiB = 0;
    let sommaVotiSoloSindaco = 0;

    righeA.forEach(rA => {
        const id = rA.getAttribute("data-id");
        const nome = rA.querySelector(".inp-sindaco-nome").value;
        const valA = parseFloat(rA.querySelector(".inp-sindaco-voti-validi").value) || 0;
        
        let valSolo = parseFloat(rA.querySelector(".inp-sindaco-voti-solo").value) || 0;
        if (isComunePiccolo) valSolo = 0;

        sommaVotiSoloSindaco += valSolo;

        const rB = document.querySelector(`#tabella-sindaco-b-body .riga-sindaco-dinamica-b[data-id="${id}"]`);
        if (rB) {
            rB.querySelector(".lbl-sindaco-specchio-nome").textContent = nome || "Candidato " + id;
            rB.querySelector(".txt-sindaco-specchio-validi").textContent = valA;
            
            const valB = parseFloat(rB.querySelector(".inp-sindaco-contestati-no").value) || 0;
            sommaContestatiB += valB;
        }
        sommaVotiValidiA += valA;
    });

    if (document.getElementById("totale-sindaco-col-a")) document.getElementById("totale-sindaco-col-a").textContent = sommaVotiValidiA;
    if (document.getElementById("totale-sindaco-col-b")) document.getElementById("totale-sindaco-col-b").textContent = sommaContestatiB;

    if (document.getElementById("quad-voti-validi")) document.getElementById("quad-voti-validi").textContent = sommaVotiValidiA;
    if (document.getElementById("quad-sindaco-non-assegnate")) document.getElementById("quad-sindaco-non-assegnate").textContent = sommaContestatiB;

    const bianche = parseFloat(document.getElementById("scrut-bianche").value) || 0;
    const nulle = parseFloat(document.getElementById("scrut-nulle").value) || 0;
    const soloNulli = parseFloat(document.getElementById("scrut-solo-nulli").value) || 0;

    if (document.getElementById("quad-bianche")) document.getElementById("quad-bianche").textContent = bianche;
    if (document.getElementById("quad-nulle")) document.getElementById("quad-nulle").textContent = nulle;
    if (document.getElementById("quad-solo-nulli")) document.getElementById("quad-solo-nulli").textContent = soloNulli;

    const totaleSchedeScrutinate = sommaVotiValidiA + bianche + nulle + soloNulli + sommaContestatiB;
    if (document.getElementById("quad-totale-scrutinate")) document.getElementById("quad-totale-scrutinate").textContent = totaleSchedeScrutinate;

    gestisciSemaforoQuadraturaInSchermo(totaleSchedeScrutinate);

    // =====================================================================================
    // LOGICA DI QUADRATURA BIS MATEMATICAMENTE BILANCIATA CON LA COLONNA B
    // =====================================================================================
    const txtTotaleVotiListe = document.getElementById("totale-voti-liste-generale");
    const totaleVotiListeGenerale = txtTotaleVotiListe ? (parseFloat(txtTotaleVotiListe.textContent) || 0) : 0;

    if (document.getElementById("bis-voti-solo-sindaco")) document.getElementById("bis-voti-solo-sindaco").textContent = sommaVotiSoloSindaco;
    if (document.getElementById("bis-voti-liste")) document.getElementById("bis-voti-liste").textContent = totaleVotiListeGenerale;
    if (document.getElementById("bis-bianche")) document.getElementById("bis-bianche").textContent = bianche;
    if (document.getElementById("bis-nulle")) document.getElementById("bis-nulle").textContent = nulle;
    if (document.getElementById("bis-solo-nulli")) document.getElementById("bis-solo-nulli").textContent = soloNulli;
    if (document.getElementById("bis-sindaco-non-assegnate")) document.getElementById("bis-sindaco-non-assegnate").textContent = sommaContestatiB;

    // FORMULA INTEGRATA: Risommiamo la Colonna B al computo dello spoglio delle schede fisiche 
    // per intercettare al millesimo la corrispondenza con il Paragrafo 23 dei votanti totali.
    let totaleCalcolatoBis = 0;
    if (isComunePiccolo) {
        // Comuni piccoli: Voti Liste + Bianche + Nulle + Solo Nulli + Schede Contestate Colonna B
        totaleCalcolatoBis = totaleVotiListeGenerale + bianche + nulle + soloNulli + sommaContestatiB;
    } else {
        // Comuni grandi: Voti Solo Sindaco + Voti Liste + Bianche + Nulle + Solo Nulli + Schede Contestate Colonna B
        totaleCalcolatoBis = sommaVotiSoloSindaco + totaleVotiListeGenerale + bianche + nulle + soloNulli + sommaContestatiB;
    }
    
    if (document.getElementById("bis-totale-calcolato")) document.getElementById("bis-totale-calcolato").textContent = totaleCalcolatoBis;

    const pannelloBis = document.getElementById("pannello-alert-bis");
    const iconaBis = document.getElementById("alert-bis-icona");
    const messaggioBis = document.getElementById("alert-bis-messaggio");

    let totaleVotantiSezione = 0;
    const txtTotVotanti = document.getElementById("p23-totale-votanti");
    totaleVotantiSezione = txtTotVotanti ? (parseFloat(txtTotVotanti.textContent) || 0) : 0;

    if (pannelloBis) {
        if (totaleVotiListeGenerale === 0 && totaleCalcolatoBis === 0) {
            pannelloBis.style.backgroundColor = "#fff"; pannelloBis.style.borderColor = "#ccc"; pannelloBis.style.color = "#7f8c8d";
            iconaBis.textContent = "⚪"; messaggioBis.textContent = "In attesa dei dati di spoglio...";
        } else if (totaleCalcolatoBis === totaleVotantiSezione) {
            pannelloBis.style.backgroundColor = "#e8f5e9"; pannelloBis.style.borderColor = "#2e7d32"; pannelloBis.style.color = "#2e7d32";
            iconaBis.textContent = "✅"; messaggioBis.textContent = "QUADRATURA BIS OK: Lo spoglio interno quadra con i votanti totali della sezione.";
        } else {
            const diffBis = Math.abs(totaleVotantiSezione - totaleCalcolatoBis);
            pannelloBis.style.backgroundColor = "#ffebee"; pannelloBis.style.borderColor = "#c62828"; pannelloBis.style.color = "#c62828";
            iconaBis.textContent = "🚨 ALERT";
            messaggioBis.textContent = `DISCORDANZA SPOGLIO INTERNO! Rilevato uno scarto di ${diffBis} voti rispetto ai votanti effettivi (§ 23).`;
        }
    }
}

function gestisciSemaforoQuadraturaInSchermo(totaleSchedeScrutinate) {
    let totaleVotantiSezione = 0;
    if (typeof VERBALE_DATA !== 'undefined' && VERBALE_DATA.parte2.p21_p22_p23_calcolati) {
        totaleVotantiSezione = VERBALE_DATA.parte2.p21_p22_p23_calcolati.totale_votanti_p23 || 0;
    } else {
        const txtTotVotanti = document.getElementById("p23-totale-votanti");
        totaleVotantiSezione = txtTotVotanti ? (parseFloat(tf.textContent) || 0) : 0;
    }

    const pannello = document.getElementById("pannello-stato-quadratura");
    const icona = document.getElementById("quad-icona");
    const messaggio = document.getElementById("quad-messaggio");
    const diffText = document.getElementById("quad-differenza");

    if (!pannello) return;

    if (totaleVotantiSezione === 0 && totaleSchedeScrutinate === 0) {
        pannello.className = ""; pannello.style.backgroundColor = "#fff"; pannello.style.color = "#7f8c8d";
        icona.textContent = "⚪"; messaggio.textContent = "In attesa dell'inserimento dei dati di spoglio..."; diffText.textContent = "";
    } else if (totaleSchedeScrutinate === totaleVotantiSezione) {
        pannello.style.backgroundColor = "#e8f5e9"; pannello.style.borderColor = "#2e7d32"; pannello.style.color = "#2e7d32";
        icona.textContent = "✅"; messaggio.textContent = "QUADRATURA PERFETTA!";
        diffText.textContent = `Le schede scrutinate (${totaleSchedeScrutinate}) quadrano con i votanti (${totaleVotantiSezione}).`;
    } else {
        const diff = totaleVotantiSezione - totaleSchedeScrutinate;
        pannello.style.backgroundColor = "#ffebee"; pannello.style.borderColor = "#c62828"; pannello.style.color = "#c62828";
        icona.textContent = "❌"; messaggio.textContent = "DISCORDANZA DATI!";
        diffText.textContent = diff > 0 ? `Mancano ${diff} schede rispetto ai votanti (${totaleVotantiSezione}).` : `Ci sono ${Math.abs(diff)} schede in PIÙ rispetto ai votanti.`;
    }
}

function salvaStatoSindacoNelModelloGlobale() {
    if (typeof VERBALE_DATA === 'undefined') return;

    const righeA = document.querySelectorAll("#tabella-sindaco-a-body .riga-sindaco-dinamica-a");
    const elencoSindaci = [];

    righeA.forEach(rA => {
        const id = rA.getAttribute("data-id");
        const nome = rA.querySelector(".inp-sindaco-nome").value;
        const liste = rA.querySelector(".inp-sindaco-liste").value;
        const valA = parseFloat(rA.querySelector(".inp-sindaco-voti-validi").value) || 0;
        const soloVoto = parseFloat(rA.querySelector(".inp-sindaco-voti-solo").value) || 0;

        const rB = document.querySelector(`#tabella-sindaco-b-body .riga-sindaco-dinamica-b[data-id="${id}"]`);
        const valB = rB ? (parseFloat(rB.querySelector(".inp-sindaco-contestati-no").value) || 0) : 0;

        elencoSindaci.push({ id, nome, liste, a: valA, solo_sindaco: soloVoto, b: valB });
    });

    if (!VERBALE_DATA.parte2.scrutinio) VERBALE_DATA.parte2.scrutinio = {};
    VERBALE_DATA.parte2.scrutinio.sindaci_dinamici_completi = elencoSindaci;
    localStorage.setItem("verbale_elettorale_mod39cs", JSON.stringify(VERBALE_DATA));
}

function ricostruisciSindaciDaStatoSalvato() {
    if (typeof VERBALE_DATA === 'undefined' || !VERBALE_DATA.parte2.scrutinio || !VERBALE_DATA.parte2.scrutinio.sindaci_dinamici_completi) return;

    document.getElementById("tabella-sindaco-a-body").innerHTML = "";
    document.getElementById("tabella-sindaco-b-body").innerHTML = "";

    const salvati = VERBALE_DATA.parte2.scrutinio.sindaci_dinamici_completi;
    salvati.forEach(s => {
        creaNuovaRigaSindacoDinamica(s.nome, s.liste, s.a, s.solo_sindaco, s.b);
    });
    sincronizzaTabelleECalcolaTotali();
}