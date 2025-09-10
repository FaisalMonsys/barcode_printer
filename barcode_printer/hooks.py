app_name = "barcode_printer"
app_title = "Barcode Printer"
app_publisher = "Faisal Ahammed"
app_description = "Printing barcode from item doc."
app_email = "faisal@gmail.com"
app_license = "mit"



doctype_js = {
    "Item": "public/js/item_barcode.js"
}


app_include_js = [
    "https://cdnjs.cloudflare.com/ajax/libs/qz-tray/2.1.0/qz-tray.js"
]


fixtures = [
    {
        "doctype": "Custom Field",
        "filters": [
            ["dt", "in", ["Item"]]
        ]
    },

    {"doctype": "Print Format", "filters": [["name", "in", ["Item Barcode ZPL"]]]}
]



doc_events = {}

override_whitelisted_methods = {
    "barcode_printer.api.barcode_api.get_item_print_formats": "barcode_printer.api.barcode_api.get_item_print_formats"
}



# Apps
# ------------------

# required_apps = []

# Each item in the list will be shown as an app in the apps page
# add_to_apps_screen = [
# 	{
# 		"name": "barcode_printer",
# 		"logo": "/assets/barcode_printer/logo.png",
# 		"title": "Barcode Printer",
# 		"route": "/barcode_printer",
# 		"has_permission": "barcode_printer.api.permission.has_app_permission"
# 	}
# ]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/barcode_printer/css/barcode_printer.css"
# app_include_js = "/assets/barcode_printer/js/barcode_printer.js"

# include js, css files in header of web template
# web_include_css = "/assets/barcode_printer/css/barcode_printer.css"
# web_include_js = "/assets/barcode_printer/js/barcode_printer.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "barcode_printer/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "barcode_printer/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# automatically load and sync documents of this doctype from downstream apps
# importable_doctypes = [doctype_1]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "barcode_printer.utils.jinja_methods",
# 	"filters": "barcode_printer.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "barcode_printer.install.before_install"
# after_install = "barcode_printer.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "barcode_printer.uninstall.before_uninstall"
# after_uninstall = "barcode_printer.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "barcode_printer.utils.before_app_install"
# after_app_install = "barcode_printer.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "barcode_printer.utils.before_app_uninstall"
# after_app_uninstall = "barcode_printer.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "barcode_printer.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"barcode_printer.tasks.all"
# 	],
# 	"daily": [
# 		"barcode_printer.tasks.daily"
# 	],
# 	"hourly": [
# 		"barcode_printer.tasks.hourly"
# 	],
# 	"weekly": [
# 		"barcode_printer.tasks.weekly"
# 	],
# 	"monthly": [
# 		"barcode_printer.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "barcode_printer.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "barcode_printer.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "barcode_printer.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["barcode_printer.utils.before_request"]
# after_request = ["barcode_printer.utils.after_request"]

# Job Events
# ----------
# before_job = ["barcode_printer.utils.before_job"]
# after_job = ["barcode_printer.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"barcode_printer.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }

