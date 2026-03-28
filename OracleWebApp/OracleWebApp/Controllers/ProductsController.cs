using System;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Web.Mvc;
using OracleWebApp.Models;

namespace OracleWebApp.Controllers
{
    /// <summary>
    /// CRUD controller for Products with logical delete, pagination, search,
    /// and optimistic concurrency via RowVersion.
    /// </summary>
    public class ProductsController : Controller
    {
        private readonly OracleDbContext _db;
        private const int PageSize = 10;

        public ProductsController()
        {
            _db = new OracleDbContext();
        }

        // For testability
        public ProductsController(OracleDbContext db)
        {
            _db = db;
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
                _db.Dispose();
            base.Dispose(disposing);
        }

        // GET: Products?search=foo&page=1
        public ActionResult Index(string search, int page = 1)
        {
            var query = _db.Products
                           .Where(p => !p.IsDeleted);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(p =>
                    p.ProductName.Contains(term) ||
                    p.Description.Contains(term));
            }

            int totalCount  = query.Count();
            int totalPages  = Math.Max(1, (int)Math.Ceiling((double)totalCount / PageSize));
            page            = Math.Max(1, Math.Min(page, totalPages));

            var products = query
                .OrderBy(p => p.ProductId)
                .Skip((page - 1) * PageSize)
                .Take(PageSize)
                .ToList();

            ViewBag.Search     = search;
            ViewBag.Page       = page;
            ViewBag.TotalPages = totalPages;

            return View(products);
        }

        // GET: Products/Details/5
        public ActionResult Details(int? id)
        {
            if (id == null)
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);

            var product = _db.Products.Find(id);
            if (product == null || product.IsDeleted)
                return HttpNotFound();

            return View(product);
        }

        // GET: Products/Create
        public ActionResult Create()
        {
            return View();
        }

        // POST: Products/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create([Bind(Include = "ProductName,Description,Price,Stock")] Product product)
        {
            if (ModelState.IsValid)
            {
                var now = DateTime.UtcNow;
                product.CreatedAt = now;
                product.UpdatedAt = now;
                product.IsDeleted = false;

                _db.Products.Add(product);
                _db.SaveChanges();
                return RedirectToAction("Index");
            }

            return View(product);
        }

        // GET: Products/Edit/5
        public ActionResult Edit(int? id)
        {
            if (id == null)
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);

            var product = _db.Products.Find(id);
            if (product == null || product.IsDeleted)
                return HttpNotFound();

            return View(product);
        }

        // POST: Products/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit([Bind(Include = "ProductId,ProductName,Description,Price,Stock,CreatedAt,IsDeleted,RowVersion")] Product product)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    product.UpdatedAt = DateTime.UtcNow;
                    _db.Entry(product).State = EntityState.Modified;
                    _db.Entry(product).Property(p => p.CreatedAt).IsModified = false;
                    _db.Entry(product).Property(p => p.IsDeleted).IsModified = false;
                    _db.SaveChanges();
                    return RedirectToAction("Index");
                }
                catch (DbUpdateConcurrencyException ex)
                {
                    var entry = ex.Entries.Single();
                    var dbValues = entry.GetDatabaseValues();

                    if (dbValues == null)
                    {
                        ModelState.AddModelError(string.Empty,
                            "This product was deleted by another user. Please go back to the list.");
                    }
                    else
                    {
                        var dbProduct = (Product)dbValues.ToObject();
                        if (dbProduct.ProductName != product.ProductName)
                            ModelState.AddModelError("ProductName", $"Current value: {dbProduct.ProductName}");
                        if (dbProduct.Description != product.Description)
                            ModelState.AddModelError("Description", $"Current value: {dbProduct.Description}");
                        if (dbProduct.Price != product.Price)
                            ModelState.AddModelError("Price", $"Current value: {dbProduct.Price:C}");
                        if (dbProduct.Stock != product.Stock)
                            ModelState.AddModelError("Stock", $"Current value: {dbProduct.Stock}");

                        ModelState.AddModelError(string.Empty,
                            "The record you attempted to edit was modified by another user. " +
                            "The conflicting values are shown above. " +
                            "Please try again with the latest data.");

                        entry.OriginalValues.SetValues(dbValues);
                        product.RowVersion = dbProduct.RowVersion;
                    }
                }
            }

            return View(product);
        }

        // GET: Products/Delete/5
        public ActionResult Delete(int? id)
        {
            if (id == null)
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);

            var product = _db.Products.Find(id);
            if (product == null || product.IsDeleted)
                return HttpNotFound();

            return View(product);
        }

        // POST: Products/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public ActionResult DeleteConfirmed(int id)
        {
            var product = _db.Products.Find(id);
            if (product != null)
            {
                product.IsDeleted = true;
                product.UpdatedAt = DateTime.UtcNow;
                _db.Entry(product).State = EntityState.Modified;
                _db.SaveChanges();
            }
            return RedirectToAction("Index");
        }
    }
}
