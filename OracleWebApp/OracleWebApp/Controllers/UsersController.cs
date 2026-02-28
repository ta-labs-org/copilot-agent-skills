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
    /// CRUD controller for Users with logical delete, pagination, search,
    /// and optimistic concurrency via RowVersion.
    /// </summary>
    public class UsersController : Controller
    {
        private readonly OracleDbContext _db;
        private const int PageSize = 10;

        public UsersController()
        {
            _db = new OracleDbContext();
        }

        // For testability
        public UsersController(OracleDbContext db)
        {
            _db = db;
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
                _db.Dispose();
            base.Dispose(disposing);
        }

        // GET: Users?search=foo&page=1
        public ActionResult Index(string search, int page = 1)
        {
            var query = _db.Users.Where(u => !u.IsDeleted);

            if (!string.IsNullOrWhiteSpace(search))
            {
                string term = search.Trim();
                query = query.Where(u => u.UserName.Contains(term) || u.FullName.Contains(term));
            }

            int totalCount  = query.Count();
            int totalPages  = Math.Max(1, (int)Math.Ceiling((double)totalCount / PageSize));
            page            = Math.Max(1, Math.Min(page, totalPages));

            var users = query
                .OrderBy(u => u.UserId)
                .Skip((page - 1) * PageSize)
                .Take(PageSize)
                .ToList();

            ViewBag.Search     = search;
            ViewBag.Page       = page;
            ViewBag.TotalPages = totalPages;

            return View(users);
        }

        // GET: Users/Details/5
        public ActionResult Details(int? id)
        {
            if (id == null)
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);

            var user = _db.Users.Find(id);
            if (user == null || user.IsDeleted)
                return HttpNotFound();

            return View(user);
        }

        // GET: Users/Create
        public ActionResult Create()
        {
            return View();
        }

        // POST: Users/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create([Bind(Include = "UserName,Email,FullName")] User user)
        {
            if (ModelState.IsValid)
            {
                var now = DateTime.UtcNow;
                user.CreatedAt = now;
                user.UpdatedAt = now;
                user.IsDeleted = false;

                _db.Users.Add(user);
                _db.SaveChanges();
                return RedirectToAction("Index");
            }

            return View(user);
        }

        // GET: Users/Edit/5
        public ActionResult Edit(int? id)
        {
            if (id == null)
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);

            var user = _db.Users.Find(id);
            if (user == null || user.IsDeleted)
                return HttpNotFound();

            return View(user);
        }

        // POST: Users/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit([Bind(Include = "UserId,UserName,Email,FullName,CreatedAt,IsDeleted,RowVersion")] User user)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    user.UpdatedAt = DateTime.UtcNow;
                    _db.Entry(user).State = EntityState.Modified;
                    // Exclude CreatedAt and IsDeleted from being modified
                    _db.Entry(user).Property(u => u.CreatedAt).IsModified = false;
                    _db.Entry(user).Property(u => u.IsDeleted).IsModified = false;
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
                            "This user was deleted by another user. Please go back to the list.");
                    }
                    else
                    {
                        var dbUser = (User)dbValues.ToObject();
                        if (dbUser.UserName != user.UserName)
                            ModelState.AddModelError("UserName", $"Current value: {dbUser.UserName}");
                        if (dbUser.Email != user.Email)
                            ModelState.AddModelError("Email", $"Current value: {dbUser.Email}");
                        if (dbUser.FullName != user.FullName)
                            ModelState.AddModelError("FullName", $"Current value: {dbUser.FullName}");

                        ModelState.AddModelError(string.Empty,
                            "The record you attempted to edit was modified by another user. " +
                            "The conflicting values are shown above. " +
                            "Please try again with the latest data.");

                        // Refresh RowVersion token
                        entry.OriginalValues.SetValues(dbValues);
                        user.RowVersion = dbUser.RowVersion;
                    }
                }
            }

            return View(user);
        }

        // GET: Users/Delete/5
        public ActionResult Delete(int? id)
        {
            if (id == null)
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);

            var user = _db.Users.Find(id);
            if (user == null || user.IsDeleted)
                return HttpNotFound();

            return View(user);
        }

        // POST: Users/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public ActionResult DeleteConfirmed(int id)
        {
            var user = _db.Users.Find(id);
            if (user != null)
            {
                user.IsDeleted  = true;
                user.UpdatedAt  = DateTime.UtcNow;
                _db.Entry(user).State = EntityState.Modified;
                _db.SaveChanges();
            }
            return RedirectToAction("Index");
        }
    }
}
