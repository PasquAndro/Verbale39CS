// js/app.js

// STATO GLOBALE DEI DATI DEL VERBALE
let VERBALE_DATA = {
    config: {
        comune: "",
        sezione: ""
    },
    parte1: {
        p1: { ruoli: {} },
        p6: { elettori_a: 0, elettori_b: 0, elettori_c: 0, schede_pacco: 0, schede_reali: 0 },
        firma: { taglia_mazzetto: 50 },
        casi: { schede_deteriorate: 0, elettori_allontanati: 0, schede_senza_bollo: 0, schede_non_riconsegnate: 0, rifiuto_cabina: 0 }
    },
    parte2: {}
};

const STORAGE_KEY = "verbale_elettorale_mod39cs";

document.addEventListener("DOMContentLoaded", () => {
    caricaDaLocalStorage();
    inizializzaAscoltoInput();
    configuraPulsantiSalvataggio();
    
    // Forza un primo calcolo generale all'avvio per riallineare i moduli
    setTimeout(() => {
        document.dispatchEvent(new CustomEvent("verbale:ricaricato"));
    }, 300);
});

function inizializzaAscoltoInput() {
    // Ascolta tutti gli input della pagina in modalità delegata
    document.body.addEventListener("input", (e) => {
        const input = e.target;
        const path = input.getAttribute("data-path");
        if (!path) return;

        // Gestione corretta dei numeri per evitare il blocco del campo vuoto
        let valore = input.value;
        if (input.type === "number") {
            valore = input.value === "" ? 0 : parseFloat(input.value);
        }
        
        // Aggiorna lo stato JSON globale
        impostaValoreDaPath(VERBALE_DATA, path, valore);
        
        // Salvataggio locale automatico nel browser
        localStorage.setItem(STORAGE_KEY, JSON.stringify(VERBALE_DATA));
        
        // Lancia l'evento globale per i moduli di calcolo specifici
        document.dispatchEvent(new CustomEvent("verbale:aggiornato", { detail: { path, valore } }));
    });
}

function caricaDaLocalStorage() {
    const datiSalvati = localStorage.getItem(STORAGE_KEY);
    if (datiSalvati) {
        try {
            VERBALE_DATA = JSON.parse(datiSalvati);
            popolaInterfaccia();
        } catch (e) {
            console.error("Errore nel caricamento dei dati locali:", e);
        }
    }
}

function popolaInterfaccia() {
    const inputs = document.querySelectorAll("input[data-path], textarea[data-path], select[data-path]");
    inputs.forEach(input => {
        const path = input.getAttribute("data-path");
        const valore = ottieniValoreDaPath(VERBALE_DATA, path);
        if (valore !== undefined && valore !== null) {
            input.value = valore;
        }
    });
}

function configuraPulsantiSalvataggio() {
    // ==========================================
    // ESPORTAZIONE FILE JSON CON FORMATTAZIONE DATA, ORA E SEZIONE
    // ==========================================
    document.getElementById("btn-salva-json").addEventListener("click", () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(VERBALE_DATA, null, 2));
        const downloadAnchor = document.createElement('a');
        
        // 1. Recupera il numero di sezione (se vuoto, imposta "ND")
        const numSez = VERBALE_DATA.config.sezione || "ND";
        
        // 2. Cattura data e ora correnti dal sistema operativo
        const oraAttuale = new Date();
        
        // Formattazione data (Es. 2026-05-30)
        const anno = oraAttuale.getFullYear();
        const mese = String(oraAttuale.getMonth() + 1).padStart(2, '0'); // I mesi in JS partono da 0
        const giorno = String(oraAttuale.getDate()).padStart(2, '0');
        
        // Formattazione orario (Es. 20-45)
        const ore = String(oraAttuale.getHours()).padStart(2, '0');
        const minuti = String(oraAttuale.getMinutes()).padStart(2, '0');
        
        const stringaDataOra = `${anno}-${mese}-${giorno}_${ore}-${minuti}`;
        
        // 3. COMPOSIZIONE STRUTTURA RICHIESTA: "Salvataggio"_NumeroSez[]_Data_Ora
        const nomeFileFinale = `Salvataggio_NumeroSez[${numSez}]_${stringaDataOra}.json`;
        
        // Esecuzione del download
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", nomeFileFinale);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    });

    // ==========================================
    // IMPORTAZIONE FILE DI BACKUP JSON
    // ==========================================
    document.getElementById("carica-json").addEventListener("change", (e) => {
        const fileReader = new FileReader();
        if (!e.target.files[0]) return;
        
        fileReader.onload = function(event) {
            try {
                const datiImportati = JSON.parse(event.target.result);
                // Validazione minima della presenza delle macro-aree
                if (datiImportati.config && datiImportati.parte1) {
                    VERBALE_DATA = datiImportati;
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(VERBALE_DATA));
                    popolaInterfaccia();
                    
                    // Notifica a cascata a tutti i file js di rigenerare i calcoli e le tabelle
                    document.dispatchEvent(new CustomEvent("verbale:ricaricato"));
                    alert("Backup del verbale caricato con successo!");
                } else {
                    alert("Il file selezionato non è un backup valido per questo applicativo.");
                }
            } catch (err) {
                alert("Errore critico nella lettura o decodifica del file JSON.");
            }
        };
        fileReader.readAsText(e.target.files[0]);
    });

    // ==========================================
    // RESET GENERALE SULLA MEMORIA DEL SEGGIO
    // ==========================================
    document.getElementById("btn-reset").addEventListener("click", () => {
        if (confirm("Sei assolutamente sicuro di voler cancellare TUTTI i dati inseriti nel verbale? L'operazione eliminerà anche la memoria locale del browser.")) {
            localStorage.removeItem(STORAGE_KEY);
            location.reload();
        }
    });
}

// UTILITIES DI SUPPORTO PER ACCEDERE AI PATH (es. "parte1.p6.elettori_a")
function impostaValoreDaPath(obj, path, value) {
    const parti = path.split('.');
    let corrente = obj;
    for (let i = 0; i < parti.length - 1; i++) {
        if (!corrente[parti[i]]) corrente[parti[i]] = {};
        corrente = corrente[parti[i]];
    }
    corrente[parti[parti.length - 1]] = value;
}

function ottieniValoreDaPath(obj, path) {
    return path.split('.').reduce((corrente, parte) => (corrente && corrente[parte] !== undefined) ? corrente[parte] : null, obj);
}
// Gestione Dinamica Paragrafo 2 - Rappresentanti di Lista

document.addEventListener("DOMContentLoaded", () => {
    const btnAggiungiRappresentante = document.getElementById("btn-aggiungi-rappresentante");
    const containerRappresentanti = document.getElementById("container-rappresentanti");

    if (btnAggiungiRappresentante && containerRappresentanti) {
        btnAggiungiRappresentante.addEventListener("click", () => {
            const prossimoId = containerRappresentanti.children.length + 1;
            
            const card = document.createElement("div");
            card.className = "card-rappresentante-coppia";
            card.setAttribute("data-index", prossimoId);
            card.style.position = "relative";
            card.style.background = "#f9f9f9";
            card.style.padding = "12px";
            card.style.border = "1px solid #e0e0e0";
            card.style.borderRadius = "4px";
            card.style.marginBottom = "10px";
            
            card.innerHTML = `
                <h4 style="margin:0 0 8px 0; color:#1e3d59;">Lista N. ${prossimoId}</h4>
                <div class="form-group" style="margin-bottom:6px;">
                    <label style="font-size:0.85rem; color:#555;">1° Rappresentante Effettivo:</label>
                    <input type="text" data-path="parte1.p2.lista_${prossimoId}.effettivo" placeholder="Cognome e Nome">
                </div>
                <div class="form-group">
                    <label style="font-size:0.85rem; color:#555;">2° Rappresentante Supplente:</label>
                    <input type="text" data-path="parte1.p2.lista_${prossimoId}.supplente" placeholder="Cognome e Nome">
                </div>
                <button type="button" class="btn-rimuovi-coppia no-print" style="position: absolute; right: 8px; top: 8px; background: transparent; border: none; color: #e74c3c; cursor: pointer; font-size: 0.85rem; font-weight: bold;"> Rimouvi</button>
            `;

            card.querySelector(".btn-rimuovi-coppia").addEventListener("click", () => {
                card.remove();
                riordinaNumerazioneCoppieRappresentanti();
                salvaStatoRappresentantiCompleto();
            });

            containerRappresentanti.appendChild(card);
            
            // Collega i nuovi input alla logica di salvataggio real-time se attiva nel core
            if (window.app && typeof window.app.bindDynamicInput === 'function') {
                card.querySelectorAll("input").forEach(inp => window.app.bindDynamicInput(inp));
            }
        });
    }

    // Intercetta modifiche manuali sui campi di testo per salvare lo stato
    if (containerRappresentanti) {
        containerRappresentanti.addEventListener("input", () => {
            salvaStatoRappresentantiCompleto();
        });
    }
    
    document.addEventListener("verbale:ricaricato", () => {
        if (typeof VERBALE_DATA !== 'undefined' && VERBALE_DATA.parte1 && VERBALE_DATA.parte1.p2_duplici) {
            ricostruisciRappresentantiDaBackupCoppie(VERBALE_DATA.parte1.p2_duplici);
        }
    });
});

/**
 * Ricalcola la numerazione corretta dei blocchi e i relativi percorsi data-path
 */
function riordinaNumerazioneCoppieRappresentanti() {
    const cards = document.querySelectorAll("#container-rappresentanti .card-rappresentante-coppia");
    cards.forEach((card, index) => {
        const nuovoNumero = index + 1;
        card.setAttribute("data-index", nuovoNumero);
        card.querySelector("h4").textContent = `Lista N. ${nuovoNumero}`;
        
        const inputs = card.querySelectorAll("input");
        if (inputs.length === 2) {
            inputs[0].setAttribute("data-path", `parte1.p2.lista_${nuovoNumero}.effettivo`);
            inputs[1].setAttribute("data-path", `parte1.p2.lista_${nuovoNumero}.supplente`);
        }
    });
}

/**
 * Sincronizza i dati inseriti con l'oggetto globale per non perdere nulla all'esportazione
 */
function salvaStatoRappresentantiCompleto() {
    if (typeof VERBALE_DATA === 'undefined') return;
    const cards = document.querySelectorAll("#container-rappresentanti .card-rappresentante-coppia");
    
    const elencoRappresentanti = [];
    cards.forEach((card, idx) => {
        const num = idx + 1;
        const inputs = card.querySelectorAll("input");
        elencoRappresentanti.push({
            lista: num,
            effettivo: inputs[0] ? inputs[0].value : "",
            supplente: inputs[1] ? inputs[1].value : ""
        });
    });

    if (!VERBALE_DATA.parte1) VERBALE_DATA.parte1 = {};
    VERBALE_DATA.parte1.p2_duplici = elencoRappresentanti;
    localStorage.setItem("verbale_elettorale_mod39cs", JSON.stringify(VERBALE_DATA));
}

/**
 * Genera i moduli aggiuntivi al caricamento del file JSON se le liste superano il numero di base
 */
function ricostruisciRappresentantiDaBackupCoppie(p2Duplici) {
    const container = document.getElementById("container-rappresentanti");
    if (!container || !p2Duplici || p2Duplici.length === 0) return;

    container.innerHTML = ""; // Resetta i 4 iniziali per iniettare i dati reali

    p2Duplici.forEach(item => {
        const btn = document.getElementById("btn-aggiungi-rappresentante");
        if (btn) {
            // Sfrutta la funzione nativa di aggiunta riga
            const prossimoid = container.children.length + 1;
            const card = document.createElement("div");
            card.className = "card-rappresentante-coppia";
            card.setAttribute("data-index", prossimoid);
            card.style.background = "#f9f9f9";
            card.style.padding = "12px";
            card.style.border = "1px solid #e0e0e0";
            card.style.borderRadius = "4px";
            card.style.marginBottom = "10px";
            card.style.position = "relative";
            
            card.innerHTML = `
                <h4 style="margin:0 0 8px 0; color:#1e3d59;">Lista N. ${prossimoid}</h4>
                <div class="form-group" style="margin-bottom:6px;">
                    <label style="font-size:0.85rem; color:#555;">1° Rappresentante Effettivo:</label>
                    <input type="text" data-path="parte1.p2.lista_${prossimoid}.effettivo" value="${item.effettivo || ''}" placeholder="Cognome e Nome">
                </div>
                <div class="form-group">
                    <label style="font-size:0.85rem; color:#555;">2° Rappresentante Supplente:</label>
                    <input type="text" data-path="parte1.p2.lista_${prossimoid}.supplente" value="${item.supplente || ''}" placeholder="Cognome e Nome">
                </div>
                <button type="button" class="btn-rimuovi-coppia no-print" style="position: absolute; right: 8px; top: 8px; background: transparent; border: none; color: #e74c3c; cursor: pointer; font-size: 0.85rem; font-weight: bold;"> Rimouvi</button>
            `;

            card.querySelector(".btn-rimuovi-coppia").addEventListener("click", () => {
                card.remove();
                riordinaNumerazioneCoppieRappresentanti();
                salvaStatoRappresentantiCompleto();
            });

            container.appendChild(card);
        }
    });
}