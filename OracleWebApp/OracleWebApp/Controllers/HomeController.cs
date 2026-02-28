using System.Web.Mvc;

namespace OracleWebApp.Controllers
{
    public class HomeController : Controller
    {
        // GET: Home
        public ActionResult Index()
        {
            return View();
        }

        // GET: Home/Error
        public ActionResult Error()
        {
            return View("~/Views/Shared/Error.cshtml");
        }
    }
}
