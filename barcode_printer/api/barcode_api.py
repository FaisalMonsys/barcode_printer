import frappe

@frappe.whitelist()
def get_item_print_formats():
    """Return available raw print formats for Item doctype."""
    formats = frappe.get_all(
        "Print Format",
        filters={"doc_type": "Item", "disabled": 0, "raw_printing": 1},
        fields=["name"]
    )
    return [f["name"] for f in formats]


@frappe.whitelist()
def render_item_print_format(docname, print_format = "Item Barcode ZPL"):
    """Render the selected print format for Item and return raw ZPL."""
    try:
        return frappe.get_print("Item", docname, print_format=print_format)
    except Exception as e:
        frappe.throw(f"Error rendering print format: {str(e)}")
