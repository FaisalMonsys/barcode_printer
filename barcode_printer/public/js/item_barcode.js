frappe.ui.form.on('Item', {
    refresh(frm) {
        render_barcodes_preview(frm);
    },
});

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

    const $grid = $(`<div style="display:flex; flex-wrap:wrap; gap:15px;"></div>`);
    wrapper.append($grid);

    loadJsBarcode(() => {
        frm.doc.barcodes.forEach((row, index) => {
            if (!row.barcode) return;

            const svgId = 'barcode_svg_' + index;
            const itemName = frm.doc.item_name || "Unnamed Item";
            const itemPrice = frm.doc.standard_rate || frm.doc.price || "0.00";

            const $container = $(`
                <div style="flex:0 0 calc(33.333% - 15px); 
                            box-sizing:border-box;
                            text-align:center; 
                            padding:10px; 
                            border:1px solid #ddd; 
                            border-radius:6px;">
                    
                    <div style="font-weight:bold; font-size:14px; margin-bottom:6px;">${itemName}</div>
                    <svg id="${svgId}" 
                         style="display:block; margin:6px auto; cursor:pointer; width:200px; height:60px;"></svg>
                    <div style="font-size:13px; margin-top:4px;">${row.barcode}</div>
                    <div style="font-size:14px; font-weight:bold; margin-top:6px;">BDT. ${parseFloat(itemPrice).toFixed(2)}</div>
                </div>
            `);

            $grid.append($container);

            try {
                JsBarcode(`#${svgId}`, String(row.barcode), {
                    format: "CODE128",
                    width: 2,
                    height: 60,
                    displayValue: false,
                    margin: 0
                });
            } catch (err) {
                console.error("❌ JsBarcode error for row " + index, err);
                $container.append('<div style="color:red">❌ Error generating barcode</div>');
            }

            // Click event ONLY on barcode SVG
            document.getElementById(svgId).onclick = () => {
                frappe.call({
                    method: "barcode_printer.api.barcode_api.get_item_print_formats",
                    callback: function(r) {
                        if (!r.message || r.message.length === 0) {
                            frappe.msgprint("⚠️ No print formats found for Item.");
                            return;
                        }

                        let d = new frappe.ui.Dialog({
                            title: "Print Barcode",
                            fields: [
                                {
                                    fieldname: "copies",
                                    label: "Number of Copies",
                                    fieldtype: "Int",
                                    default: 1,
                                    reqd: 1
                                },
                                {
                                    fieldname: "format",
                                    label: "Print Format",
                                    fieldtype: "Select",
                                    options: r.message,
                                    default: "Item Barcode ZPL", // by default this print format will work,
                                    reqd: 1
                                }
                            ],
                            primary_action_label: "Print",
                            primary_action(values) {
                                frappe.call({
                                    method: "barcode_printer.api.barcode_api.render_item_print_format",
                                    args: {
                                        docname: frm.doc.name,
                                        print_format: values.format,
                                        // send the clicked barcode ------------------------------
                                        barcode_value: row.barcode  
                                    },
                                    callback: function(res) {
                                        if (res.message) {
                                            print_to_zebra(res.message, values.copies, values.format);
                                        } else {
                                            frappe.msgprint("⚠️ Failed to render print format.");
                                        }
                                    }
                                });
                                d.hide();
                            }
                        });

                        d.show();
                    }
                });
            };
        });
    });
}

function print_to_zebra(zpl, copies = 1, print_format = "Default") {
    frappe.ui.form.qz_connect()
        .then(() => qz.printers.find("Zebra_Technologies_ZTC_ZD230-203dpi_ZPL"))
        .then(printer => {
            if (!printer) throw new Error("Zebra printer not found!");

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
        .then(() => frappe.show_alert({ message: `✅ ${copies} label(s) printed with format: ${print_format}`, indicator: "green" }))
        .catch(err => frappe.msgprint("QZ Print Error: " + err));
}
