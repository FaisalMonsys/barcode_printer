frappe.ui.form.on('Item', {
    refresh(frm) {
        render_barcodes_preview(frm);
        attach_live_barcode_listeners(frm);
    },
    barcodes_add(frm) {
        render_barcodes_preview(frm);
        attach_live_barcode_listeners(frm);
    },
    barcodes_on_form_rendered(frm) {
        render_barcodes_preview(frm);
        attach_live_barcode_listeners(frm);
    }
});

frappe.ui.form.on('Barcodes', {
    barcode(frm, cdt, cdn) {
        render_barcodes_preview(frm);
    }
});

// ------------------ JsBarcode Loader ------------------

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

// ------------------ Live Listeners ------------------

function attach_live_barcode_listeners(frm) {
    setTimeout(() => {
        frm.fields_dict["barcodes"].grid.grid_rows.forEach(row => {
            let $input = $(row.row).find('[data-fieldname="barcode"] input');
            if ($input && !$input.data("barcode-listener")) {
                $input.on("keyup", () => render_barcodes_preview(frm));
                $input.data("barcode-listener", true);
            }
        });
    }, 300);
}

// ------------------ Barcode Preview ------------------

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

            // Generate barcode preview
            try {
                JsBarcode(`#${svgId}`, String(row.barcode), {
                    format: "CODE128",
                    width: 2,
                    height: 60,
                    displayValue: false,
                    margin: 10
                });
            } catch (err) {
                console.error("❌ JsBarcode error for row " + index, err);
                $container.append('<div style="color:red">❌ Error generating barcode</div>');
            }

            // Print handler
            document.getElementById(`barcode_clickable_${index}`).onclick = () => {
                let copies = parseInt(prompt("How many copies do you want to print?", "1"));
                if (!isNaN(copies) && copies > 0) {
                    select_printer_and_print(`#${svgId}`, copies);
                } else {
                    frappe.msgprint("⚠️ Invalid number of copies.");
                }
            };
        });
    });
}

// ------------------ Print Functions ------------------

function select_printer_and_print(svgSelector, copies = 1) {
    frappe.ui.form.qz_connect()
        .then(() => qz.printers.find())
        .then(printers => {
            if (!printers || printers.length === 0) throw new Error("⚠️ No printers found via QZ Tray.");

            let options = printers.map(p => `<option value="${p}">${p}</option>`).join("");
            let dialogHtml = `
                <label>Select Printer:</label>
                <select id="printer_select" style="width:100%; margin:10px 0; padding:5px;">
                    ${options}
                </select>
            `;

            frappe.prompt([
                { fieldname: "printer_html", fieldtype: "HTML", options: dialogHtml, label: "Printer" }
            ], () => {
                let selectedPrinter = document.getElementById("printer_select").value;
                if (!selectedPrinter) {
                    frappe.msgprint("⚠️ No printer selected.");
                    return;
                }
                print_barcode_svg(svgSelector, selectedPrinter, copies);
            }, __("Select Printer"));
        })
        .catch(err => frappe.msgprint("QZ Print Error: " + err));
}

function print_barcode_svg(svgSelector, printerName, copies) {
    let svgElement = document.querySelector(svgSelector);
    if (!svgElement) {
        frappe.msgprint("⚠️ SVG element not found for printing.");
        return;
    }

    // Convert SVG to Data URI (base64)
    let svgData = new XMLSerializer().serializeToString(svgElement);
    let svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    let svgUrl = URL.createObjectURL(svgBlob);

    // Use QZ Tray to print image
    let config = qz.configs.create(printerName);

    let data = [];
    for (let i = 0; i < copies; i++) {
        data.push({ type: "image", data: svgUrl });
    }

    qz.print(config, data)
        .then(() => frappe.show_alert({ message: `✅ ${copies} barcode(s) sent to ${printerName}`, indicator: "green" }))
        .catch(err => frappe.msgprint("QZ Print Error: " + err));
}
