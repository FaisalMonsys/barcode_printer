frappe.ui.form.on('Item', {
    refresh(frm) {
        render_barcodes_preview(frm);
        
    },
 
});

// ------------------ Helper Functions ------------------

function loadJsBarcode(callback) {
    if (window.JsBarcode) {
        callback();
        return;
    }
    const src = 'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js';
    let s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = src;
    s.onload = callback;
    s.onerror = () => console.error("❌ Failed to load JsBarcode");
    document.head.appendChild(s);
}

function render_barcodes_preview(frm) {
    if (!frm.fields_dict || !frm.fields_dict['custom_barcode_preview']) {
        console.warn("⚠️ HTML field custom_barcode_preview not found in Item doctype");
        return;
    }

    const wrapper = frm.fields_dict['custom_barcode_preview'].$wrapper;
    wrapper.empty();

    if (!frm.doc.barcodes || frm.doc.barcodes.length === 0) {
        wrapper.append('<div style="color:#666;font-style:italic">⚠️ No barcodes found</div>');
        return;
    }

    loadJsBarcode(() => {
        frm.doc.barcodes.forEach((row, index) => {
            if (!row.barcode) return;

            const itemName = frm.doc.item_name || "Unnamed Item";
            const itemPrice = frm.doc.standard_rate || frm.doc.price || "0.00";
            const svgId = 'barcode_svg_' + index;

            // Container
            const $container = $(`
                <div id="barcode_clickable_${index}" 
                    style="margin:20px 0; padding:10px; border:1px solid #ddd; border-radius:6px; text-align:center; cursor:pointer;">
                    
                    <div style="font-weight:bold; font-size:16px;">${itemName}</div>
                    <svg id="${svgId}" style="display:block; margin:6px auto;"></svg>
                    <div style="font-size:14px; margin-top:4px;">${row.barcode}</div>
                    <div style="font-size:16px; font-weight:bold; margin-top:4px;">BDT. ${parseFloat(itemPrice).toFixed(2)}</div>
                    <div style="font-size:12px; color:grey; margin-top:4px;">Click to Print</div>
                </div>
            `);

            wrapper.append($container);

            // Generate barcode SVG
            try {
                let maxBarWidth = 2;
                let calculatedWidth = Math.min((280 / row.barcode.length), maxBarWidth);

                JsBarcode(`#${svgId}`, String(row.barcode), {
                    format: "CODE128",
                    width: calculatedWidth,
                    height: 60,
                    displayValue: false,
                    margin: 10
                });
            } catch (err) {
                console.error("❌ JsBarcode error for row " + index, err);
                $container.append('<div style="color:red">❌ Error generating barcode</div>');
            }

            // Attach print click
            document.getElementById(`barcode_clickable_${index}`).onclick = () => {
                let copies = parseInt(prompt("How many copies do you want to print?", "1"));
                if (!isNaN(copies) && copies > 0) {
                    print_to_zebra(frm, row.barcode, itemName, itemPrice, copies);
                } else {
                    frappe.msgprint("⚠️ Invalid number of copies.");
                }
            };
        });
    });
}

// ------------------ ZPL Printing ------------------
function print_to_zebra(frm, barcode, itemName, itemPrice, copies = 1) {
    frappe.ui.form.qz_connect()
        .then(() => qz.printers.find("Zebra_Technologies_ZTC_ZD230-203dpi_ZPL"))
        .then(printer => {
            if (!printer) throw new Error("Zebra printer not found!");

            let zpl = `
^XA
^CI28
^PW320
^LL200
^LH0,20
^SD15

^FO100,20^A0N,18,20^FD${itemName}^FS
^FO90,50^BY2,3,50^BEN,50,Y,N^FD${barcode}^FS
^FO90,130^A0N,25,32^FDBDT. ${parseFloat(itemPrice).toFixed(2)}^FS

^XZ
`;

            let config = qz.configs.create(printer, {
                forceRaw: true,
                density: 203,
                size: { width: 3, height: 2, units: "in" },
                margins: 0
            });

            let data = [];
            for (let i = 0; i < copies; i++) {
                data.push({ type: "raw", format: "command", flavor: "plain", data: zpl });
            }

            return qz.print(config, data);
        })
        .then(() => frappe.show_alert({ message: `✅ ${copies} label(s) sent to Zebra!`, indicator: "green" }))
        .catch(err => frappe.msgprint("QZ Print Error: " + err));
}
