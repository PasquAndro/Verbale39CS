// js/parte1/autenticazione.js

document.addEventListener("DOMContentLoaded", () => {
    // Ascolta le notifiche dal motore principale
    document.addEventListener("verbale:aggiornato", () => {
        sincronizzaAnagraficaEseguiCalcoli();
    });

    document.addEventListener("verbale:ricaricato", () => {
        sincronizzaAnagraficaEseguiCalcoli();
    });

    // Controllo di sicurezza aggiuntivo: intercetta direttamente i tasti premuti sulle caselle numeriche
    const idsMonitorati = ["p6-iscritti-lista", "p6-iscritti-cura", "p6-iscritti-ue", "p6-scheche-pacco", "p6-schede-pacco", "p6-schede-reali", "firma-taglia-mazzetto"];
    idsMonitorati.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("input", sincronizzaAnagraficaEseguiCalcoli);
            el.addEventListener("change", sincronizzaAnagraficaEseguiCalcoli);
        }
    });

    // Esegui subito al caricamento iniziale
    setTimeout(sincronizzaAnagraficaEseguiCalcoli, 250);
});

function sincronizzaAnagraficaEseguiCalcoli() {
    // 1. SINCRONIZZAZIONE ANAGRAFICA SEGGIO
    const presInput = document.getElementById("p1-presidente");
    const segInput = document.getElementById("p1-segretario");
    const syncPres = document.getElementById("sync-pres");
    const syncSeg = document.getElementById("sync-seg");
    
    if (presInput && syncPres) syncPres.value = presInput.value;
    if (segInput && syncSeg) syncSeg.value = segInput.value;

    // 2. RECUPERO VALORI NUMERICI DIRETTAMENTE DAL DOM
    const elLista = document.getElementById("p6-iscritti-lista");
    const elCura = document.getElementById("p6-iscritti-cura");
    const elUe = document.getElementById("p6-iscritti-ue");
    const elPaccoNominale = document.getElementById("p6-schede-pacco");
    const elPaccoReale = document.getElementById("p6-schede-reali");

    const iscrittiLista = elLista ? (parseFloat(elLista.value) || 0) : 0;
    const iscrittiCura = elCura ? (parseFloat(elCura.value) || 0) : 0;
    const iscrittiUe = elUe ? (parseFloat(elUe.value) || 0) : 0;
    const schedePaccoNominale = elPaccoNominale ? (parseFloat(elPaccoNominale.value) || 0) : 0;
    const schedeContateReali = elPaccoReale ? (parseFloat(elPaccoReale.value) || 0) : 0;

    // 3. CALCOLO ARITMETICO ELETTORI E SCHEDE DA AUTENTICARE (a + b + c)
    const totaleElettori = iscrittiLista + iscrittiCura + iscrittiUe;
    const schedeDaAutenticare = totaleElettori; 

    // 4. CALCOLO SCHEDE RESIDUE NON AUTENTICATE (BUSTA 3-CS)
    // Se l'utente inserisce le schede reali contate a mano, usiamo quelle come base, altrimenti usiamo il dato del comune
    const baseCalcoloPacco = schedeContateReali > 0 ? schedeContateReali : schedePaccoNominale;
    let schedeNonAutenticate = baseCalcoloPacco - schedeDaAutenticare;
    if (schedeNonAutenticate < 0) schedeNonAutenticate = 0;

    // 5. AGGIORNAMENTO DI TUTTI I CAMPI INTERFACCIA A SCHERMO
    const txtTotElettori = document.getElementById("p6-totale-elettori");
    const txtDaAut = document.getElementById("p6-schede-da-autenticare");
    const txtNonAut = document.getElementById("p6-non-autenticate") || document.getElementById("p6-schede-non-autenticate");
    const txtFirmaTot = document.getElementById("firma-totale-schede");

    if (txtTotElettori) txtTotElettori.textContent = totaleElettori;
    if (txtDaAut) txtDaAut.textContent = schedeDaAutenticare;
    if (txtNonAut) txtNonAut.textContent = schedeNonAutenticate;
    if (txtFirmaTot) txtFirmaTot.textContent = schedeDaAutenticare; // Il numero di schede da ripartire per la firma è ESATTAMENTE il Totale Elettori da autenticare

    // 6. AVVIO ALGORITMO RIPARTIZIONE MAZZETTI CON RESTI
    eseguiRipartizioneMazzettiFirma(schedeDaAutenticare);

    // 7. SALVATAGGIO DEI CALCOLI NELL'OGGETTO CENTRALE
    if (typeof VERBALE_DATA !== 'undefined') {
        VERBALE_DATA.parte1.p6_calcolati = {
            totale_elettori_complesso: totaleElettori,
            schede_da_autenticare: schedeDaAutenticare,
            schede_busta3_residue: schedeNonAutenticate,
            schede_reali_totale_pacco: baseCalcoloPacco
        };
    }
    
    // Aggiorna a catena i totali della Parte Seconda
    if (window.eseguiRiportiEQuadratureParte2) {
        window.eseguiRiportiEQuadratureParte2();
    }
}

function eseguiRipartizioneMazzettiFirma(schedeTotali) {
    const tbody = document.getElementById("tabella-firmatari-body");
    if (!tbody) return;

    if (schedeTotali <= 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#999; padding:15px;">Inserisci il numero di elettori nel § 6 per attivare la ripartizione automatica</td></tr>`;
        if (document.getElementById("firma-totale-mazzetti")) document.getElementById("firma-totale-mazzetti").textContent = 0;
        return;
    }

    const selectMazzetto = document.getElementById("firma-taglia-mazzetto");
    const tagliaMazzetto = selectMazzetto ? parseInt(selectMazzetto.value) : 50;
    
    // Calcoliamo quanti mazzetti servono (arrotondato per eccesso)
    const totaleMazzetti = Math.ceil(schedeTotali / tagliaMazzetto);
    if (document.getElementById("firma-totale-mazzetti")) document.getElementById("firma-totale-mazzetti").textContent = totaleMazzetti;

    // Lettura dinamica dei nomi inseriti nei campi di testo
    const prendiNomeId = (id, diDefault) => {
        const el = document.getElementById(id);
        return (el && el.value.trim() !== "") ? el.value : diDefault;
    };

    let firmatari = [
        { ruolo: "Vice Presidente", nome: prendiNomeId("p1-vice-pres", "Vice Presidente"), mazzetti: 0, schede: 0 },
        { ruolo: "Scrutatore 1", nome: prendiNomeId("p1-scrut1", "Scrutatore 1"), mazzetti: 0, schede: 0 },
        {




 ruolo: "Scrutatore 2", nome: prendiNomeId("p1-scrut2", "Scrutatore 2"), mazzetti: 0, schede: 0 },
        { ruolo: "Scrutatore 3", nome: prendiNomeId("p1-scrut3", "Scrutatore 3"), mazzetti: 0, schede: 0 },
        { ruolo: "Scrutatore 4", nome: prendiNomeId("p1-scrut4", "Scrutatore 4"), mazzetti: 0, schede: 0 }
    ];

    // Distribuzione matematica dei mazzetti interi sui 5 componenti
    const mazzettiBase = Math.floor(totaleMazzetti / 5);
    let restoMazzetti = totaleMazzetti % 5;

    firmatari.forEach(f => f.mazzetti = mazzettiBase);
    
    // Assegna i mazzetti di resto avanzati uno alla volta ai primi firmatari
    for (let i = 0; i < restoMazzetti; i++) {
        firmatari[i].mazzetti += 1;
    }

    // Calcolo delle schede reali per firmatario tenendo conto dell'ultimo mazzetto incompleto (resto)
    let schedeRimanentiDaDistribuire = schedeTotali;

    firmatari.forEach((f) => {
        if (f.mazzetti === 0) {
            f.schede = 0;
            return;
        }

        let schedeTeoriche = f.mazzetti * tagliaMazzetto;

        if (schedeRimanentiDaDistribuire >= schedeTeoriche) {
            f.schede = schedeTeoriche;
            schedeRimanentiDaDistribuire -= schedeTeoriche;
        } else {
            f.schede = schedeRimanentiDaDistribuire;
            schedeRimanentiDaDistribuire = 0;
        }
    });

    // Rendering visivo dei dati dentro la tabella
    tbody.innerHTML = "";
    firmatari.forEach((f) => {
        const row = document.createElement("tr");
        const notaResto = (f.mazzetti * tagliaMazzetto !== f.schede && f.schede > 0) 
            ? ` <span style="color:#e65100; font-size:0.85em; font-weight:normal;">(include mazzetto finale parziale di resto)</span>` 
            : "";

        row.innerHTML = `
            <td><b>${f.nome}</b></td>
            <td>${f.ruolo}</td>
            <td><span class="badge-mazzetti" style="background:#00bcd4; color:#fff; padding:3px 8px; border-radius:3px; font-weight:bold;">${f.mazzetti} mazzetti</span></td>
            <td><strong>${f.schede} schede</strong>${notaResto}</td>
        `;
        tbody.appendChild(row);
    });
}