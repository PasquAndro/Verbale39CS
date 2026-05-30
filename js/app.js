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