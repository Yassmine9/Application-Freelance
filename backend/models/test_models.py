from models.product import Product
from models.purchase import Purchase
from models.category import Category
from models.admin_stat import AdminStat
from models.report import Report


# Create product (ALL required fields provided)
product = Product.create(
    creator_id="user4",
    title="super design",
    description="A productivity mobile application for freelancers design.",
    version="2.3.0",
    license="MIT",
    price=8.0,
    file_path="/uploads/super_design_v1.zip"
)

print("Product created:", product)


# Create purchase using product id
purchase = Purchase.create(
    buyer_id="user1",
    product_id=product["_id"]
)

print("Purchase created:", purchase)


# Create category
category = Category.create(
    name="Design",
    type_="product"
)

print("Category created:", category)


# Create admin stats document
admin_stat = AdminStat.create(
    total_users=4,
    total_gigs=0,
    total_products=2,
    total_offers=0
)

print("Admin stat created:", admin_stat)


# Create report
report = Report.create(
    reported_by="user1",
    target_type="product",
    target_id=product["_id"],
    reason="Inappropriate content",
    status="pending"
)

print("Report created:", report)


# Get all products
all_products = Product.get_all()
print("All products:", all_products)