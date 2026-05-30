// js/parte2/scrutinio_liste.js

document.addEventListener("DOMContentLoaded", () => {
    // Inizializza l'ascolto sul pulsante "Aggiungi"
    const btnAggiungi = document.getElementById("btn-aggiungi-lista");
    if (btnAggiungi) {
        btnAggiungi.addEventListener("click", () => {
            creaNuovaRigaListaInTabella("", 0, 0);
            salvaStatoListeNelModelloGlobale();
        });
    }

    // Se l'applicazione viene ricaricata o riaperta, ricrea le liste salvate nel LocalStorage
    document.addEventListener("verbale:ricaricato", () => {
        ricostruisciListeDaStatoSalvato();
    });

    // Intercetta gli input all'interno della tabella per i calcoli in tempo reale
    const tbody = document.getElementById("tabella-liste-consiglio-body");
    if (tbody) {
        tbody.addEventListener("input", () => {
            ricalcolaTotaliListeConsiglio();
            salvaStatoListeNelModelloGlobale();
        });
    }

    setTimeout(ricostruisciListeDaStatoSalvato, 400);
});

/**
 * Crea fisicamente una riga editabile all'interno della tabella HTML
 */
function creaNuovaRigaListaInTabella(nomeLista = "", valoreA = 0, valoreB = 0) {
    const tbody = document.getElementById("tabella-liste-consiglio-body");
    if (!tbody) return;

    // Calcoliamo in automatico il numero progressivo della lista basandoci sul numero di righe presenti
    const numeroLista = tbody.children.length + 1;

    const row = document.createElement("tr");
    row.className = "riga-lista-dinamica";
    
    row.innerHTML = `
        <td style="text-align:center; font-weight:bold; color:#1e3d59;">${numeroLista}</td>
        <td>
            <input type="text" class="input-nome-lista" placeholder="Es. Lista Civica Primavera" value="${nomeLista}" style="font-weight:bold; border-bottom:1px solid #ccc !important;">
        </td>
        <td>
            <input type="number" class="input-col-a" value="${valoreA}" min="0" style="text-align:right; font-family:monospace; font-weight:bold;">
        </td>
        <td>
            <input type="number" class="input-col-b" value="${valoreB}" min="0" style="text-align:right; font-family:monospace; font-weight:bold;">
        </td>
        <td style="text-align: right; background-color: #fafafa;">
            <strong class="txt-tot-riga-lista" style="font-family:monospace; color:#1e3d59;">0</strong>
        </td>
        <td class="no-print" style="text-align:center;">
            <button type="button" class="btn-cancella-riga" style="background:#e74c3c; color:white; padding:3px 8px; border-radius:3px; font-size:0.8rem; font-weight:bold; cursor:pointer;">❌ Rimuovi</button>
        </td>
    `;

    // Gestione del pulsante di cancellazione della singola riga
    row.querySelector(".btn-cancella-riga").addEventListener("click", () => {
        row.remove();
        riordinaNumerazioneProgressivaListe();
        ricalcolaTotaliListeConsiglio();
        salvaStatoListeNelModelloGlobale();
    });

    tbody.appendChild(row);
    ricalcolaTotaliListeConsiglio();
}

/**
 * Riordina i numeri della prima colonna (1, 2, 3...) se viene rimossa una riga intermedia
 */
function riordinaNumerazioneProgressivaListe() {
    const righe = document.querySelectorAll("#tabella-liste-consiglio-body .riga-lista-dinamica");
    righe.forEach((riga, index) => {
        riga.children[0].textContent = index + 1;
    });
}

/**
 * Esegue i calcoli matematici (orizzontali e verticali) su tutte le righe create
 */
function ricalcolaTotaliListeConsiglio() {
    const righe = document.querySelectorAll("#tabella-liste-consiglio-body .riga-lista-dinamica");
    
    let totaleA = 0;
    let totaleB = 0;
    let totaleGenerale = 0;

    righe.forEach(riga => {
        const inputA = riga.querySelector(".input-col-a");
        const inputB = riga.querySelector(".input-col-b");
        const txtTot = riga.querySelector(".txt-tot-riga-lista");

        const valA = inputA ? (parseFloat(inputA.value) || 0) : 0;
        const valB = inputB ? (parseFloat(inputB.value) || 0) : 0;
        
        // Calcolo orizzontale della singola riga
        const totRiga = valA + valB;
        if (txtTot) txtTot.textContent = totRiga;

        // Somme verticali
        totaleA += valA;
        totaleB += valB;
        totaleGenerale += totRiga;
    });

    // Aggiorna le celle dei totali di fine tabella
    if (document.getElementById("totale-colonna-a")) document.getElementById("totale-colonna-a").textContent = totaleA;
    if (document.getElementById("totale-colonna-b")) document.getElementById("totale-colonna-b").textContent = totaleB;
    if (document.getElementById("totale-voti-liste-generale")) document.getElementById("totale-voti-liste-generale").textContent = totaleGenerale;

    // Aggiorna automaticamente il Prospetto Riepilogativo (§ 38)
    const txtQuadListe = document.getElementById("quad-voti-liste");
    if (txtQuadListe) txtQuadListe.textContent = totaleGenerale;
}

/**
 * Immagazzina i dati scritti a mano dentro l'oggetto globale VERBALE_DATA per consentire il backup
 */
function salvaStatoListeNelModelloGlobale() {
    if (typeof VERBALE_DATA === 'undefined') return;

    const righe = document.querySelectorAll("#tabella-liste-consiglio-body .riga-lista-dinamica");
    const elencoListeDaSalvare = [];

    righe.forEach((riga, index) => {
        const nome = riga.querySelector(".input-nome-lista").value;
        const valA = parseFloat(riga.querySelector(".input-col-a").value) || 0;
        const valB = parseFloat(riga.querySelector(".input-col-b").value) || 0;

        elencoListeDaSalvare.push({
            numero: index + 1,
            nome: nome,
            a: valA,
            b: valB
        });
    });

    // Salviamo l'array delle liste create nello stato della Parte 2
    if (!VERBALE_DATA.parte2.liste_scrutinate_dinamiche) {
        VERBALE_DATA.parte2.liste_scrutinate_dinamiche = [];
    }
    
    VERBALE_DATA.parte2.liste_scrutinate_dinamiche = elencoListeDaSalvare;
    
    // Aggiorna anche le somme generali nell'oggetto di stato
    VERBALE_DATA.parte2.liste_calcolate = {
        totale_verticale_a: parseFloat(document.getElementById("totale-colonna-a").textContent) || 0,
        totale_verticale_b: parseFloat(document.getElementById("totale-colonna-b").textContent) || 0,
        totale_generale_voti_lista: parseFloat(document.getElementById("totale-voti-liste-generale").textContent) || 0
    };

    localStorage.setItem("verbale_elettorale_mod39cs", JSON.stringify(VERBALE_DATA));
}

/**
 * Riprende le liste salvate e le ricrea a schermo (es. dopo F5 o caricamento file JSON)
 */
function ricostruisciListeDaStatoSalvato() {
    if (typeof VERBALE_DATA === 'undefined' || !VERBALE_DATA.parte2.liste_scrutinate_dinamiche) return;

    const tbody = document.getElementById("tabella-liste-consiglio-body");
    if (!tbody) return;
    
    tbody.innerHTML = ""; // Svuota l'interfaccia corrente

    const listeSalvate = VERBALE_DATA.parte2.liste_scrutinate_dinamiche;
    
    if (listeSalvate.length > 0) {
        listeSalvate.forEach(lista => {
            creaNuovaRigaListaInTabella(lista.nome, lista.a, lista.b);
        });
    }
}