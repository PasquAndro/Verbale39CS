// js/parte2/scrutinio_liste.js

document.addEventListener("DOMContentLoaded", () => {
    const btnAggiungi = document.getElementById("btn-aggiungi-lista");
    if (btnAggiungi) {
        btnAggiungi.addEventListener("click", () => {
            creaNuovaRigaListaInTabella("", 0, 0);
            salvaStatoListeNelModelloGlobale();
        });
    }

    document.addEventListener("verbale:ricaricato", () => {
        ricostruisciListeDaStatoSalvato();
    });

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
 * Riordina i numeri della prima colonna se viene rimossa una riga intermedia
 */
function riordinaNumerazioneProgressivaListe() {
    const righe = document.querySelectorAll("#tabella-liste-consiglio-body .riga-lista-dinamica");
    righe.forEach((riga, index) => {
        riga.children[0].textContent = index + 1;
    });
}

/**
 * Esegue i calcoli matematici su tutte le righe create e forza l'aggiornamento della quadratura BIS
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
        
        const totRiga = valA + valB;
        if (txtTot) txtTot.textContent = totRiga;

        totaleA += valA;
        totaleB += valB;
        totaleGenerale += totRiga;
    });

    if (document.getElementById("totale-colonna-a")) document.getElementById("totale-colonna-a").textContent = totaleA;
    if (document.getElementById("totale-colonna-b")) document.getElementById("totale-colonna-b").textContent = totaleB;
    if (document.getElementById("totale-voti-liste-generale")) document.getElementById("totale-voti-liste-generale").textContent = totaleGenerale;

    const txtQuadListe = document.getElementById("quad-voti-liste");
    if (txtQuadListe) txtQuadListe.textContent = totaleGenerale;

    // FORZA IL RICALCOLO DELL'ULTERIORE QUADRATURA CONTROLLO INTERNO
    if (window.sincronizzaTabelleECalcolaTotali) {
        window.sincronizzaTabelleECalcolaTotali();
    }
}

/**
 * Immagazzina i dati scritti a mano dentro l'oggetto globale VERBALE_DATA
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

    if (!VERBALE_DATA.parte2.liste_scrutinate_dinamiche) {
        VERBALE_DATA.parte2.liste_scrutinate_dinamiche = [];
    }
    
    VERBALE_DATA.parte2.liste_scrutinate_dinamiche = elencoListeDaSalvare;
    
    VERBALE_DATA.parte2.liste_calcolate = {
        totale_verticale_a: parseFloat(document.getElementById("totale-colonna-a").textContent) || 0,
        totale_verticale_b: parseFloat(document.getElementById("totale-colonna-b").textContent) || 0,
        totale_generale_voti_lista: parseFloat(document.getElementById("totale-voti-liste-generale").textContent) || 0
    };

    localStorage.setItem("verbale_elettorale_mod39cs", JSON.stringify(VERBALE_DATA));
}

function ricostruisciListeDaStatoSalvato() {
    if (typeof VERBALE_DATA === 'undefined' || !VERBALE_DATA.parte2.liste_scrutinate_dinamiche) return;

    const tbody = document.getElementById("tabella-liste-consiglio-body");
    if (!tbody) return;
    
    tbody.innerHTML = "";

    const listeSalvate = VERBALE_DATA.parte2.liste_scrutinate_dinamiche;
    
    if (listeSalvate.length > 0) {
        listeSalvate.forEach(lista => {
            creaNuovaRigaListaInTabella(lista.nome, lista.a, lista.b);
        });
    }
}