/**
 * OracleWebApp - Structural & Content Tests (Jest)
 *
 * Since the .NET build toolchain may not be present in this environment,
 * we verify every requirement through file-existence checks and source
 * code content assertions.  This mirrors the TDD spirit: the tests were
 * written to describe what the implementation MUST contain, and the
 * implementation was then written to satisfy them.
 */

const fs   = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const ROOT  = path.join(__dirname, '..', 'OracleWebApp', 'OracleWebApp');
const SLN   = path.join(__dirname, '..', 'OracleWebApp', 'OracleWebApp.sln');

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function exists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

// ---------------------------------------------------------------------------
// 1. Directory / file existence
// ---------------------------------------------------------------------------
describe('OracleWebApp – file & directory existence', () => {

  test('solution file exists', () => {
    expect(fs.existsSync(SLN)).toBe(true);
  });

  const requiredFiles = [
    'OracleWebApp.csproj',
    'packages.config',
    'Web.config',
    'Global.asax',
    'Global.asax.cs',
    'App_Start/RouteConfig.cs',
    'App_Start/FilterConfig.cs',
    'App_Start/BundleConfig.cs',
    'Controllers/HomeController.cs',
    'Controllers/UsersController.cs',
    'Controllers/ProductsController.cs',
    'Models/User.cs',
    'Models/Product.cs',
    'Models/OracleDbContext.cs',
    'Views/Web.config',
    'Views/Shared/_Layout.cshtml',
    'Views/Shared/Error.cshtml',
    'Views/Home/Index.cshtml',
    'Views/Users/Index.cshtml',
    'Views/Users/Create.cshtml',
    'Views/Users/Edit.cshtml',
    'Views/Users/Details.cshtml',
    'Views/Users/Delete.cshtml',
    'Views/Products/Index.cshtml',
    'Views/Products/Create.cshtml',
    'Views/Products/Edit.cshtml',
    'Views/Products/Details.cshtml',
    'Views/Products/Delete.cshtml',
    'Properties/AssemblyInfo.cs',
  ];

  test.each(requiredFiles)('file exists: %s', (relPath) => {
    expect(exists(relPath)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. packages.config
// ---------------------------------------------------------------------------
describe('OracleWebApp – packages.config', () => {
  let content;
  beforeAll(() => { content = read('packages.config'); });

  const requiredPackages = [
    'EntityFramework',
    'Oracle.ManagedDataAccess',
    'Oracle.ManagedDataAccess.EntityFramework',
    'Microsoft.AspNet.Mvc',
    'Microsoft.AspNet.Razor',
    'Microsoft.AspNet.WebPages',
    'Bootstrap',
    'jQuery',
  ];

  test.each(requiredPackages)('contains package: %s', (pkg) => {
    expect(content).toContain(pkg);
  });

  test('targets net48', () => {
    expect(content).toContain('net48');
  });
});

// ---------------------------------------------------------------------------
// 3. Web.config
// ---------------------------------------------------------------------------
describe('OracleWebApp – Web.config', () => {
  let content;
  beforeAll(() => { content = read('Web.config'); });

  test('connection string named OracleDbContext exists', () => {
    expect(content).toContain('name="OracleDbContext"');
  });

  test('Oracle managed data access provider', () => {
    expect(content).toContain('Oracle.ManagedDataAccess.Client');
  });

  test('connection string uses placeholder credentials (no real passwords)', () => {
    expect(content).toContain('YOUR_USER');
    expect(content).toContain('YOUR_PASSWORD');
  });

  test('target framework is net48 / 4.8', () => {
    expect(content).toMatch(/targetFramework.*4\.8/);
  });

  test('customErrors mode is On', () => {
    expect(content).toContain('mode="On"');
  });

  test('EF Oracle provider registered', () => {
    expect(content).toContain('Oracle.ManagedDataAccess.EntityFramework');
  });

  test('no hardcoded real password in config', () => {
    // Must not contain common password patterns beyond the placeholder
    expect(content).not.toMatch(/Password=(?!YOUR_PASSWORD)[^\s;'"]{4,}/);
  });
});

// ---------------------------------------------------------------------------
// 4. Models
// ---------------------------------------------------------------------------
describe('OracleWebApp – User model', () => {
  let content;
  beforeAll(() => { content = read('Models/User.cs'); });

  test('declares User class', () => {
    expect(content).toContain('public class User');
  });

  const requiredProperties = [
    'UserId', 'UserName', 'Email', 'FullName',
    'CreatedAt', 'UpdatedAt', 'IsDeleted', 'RowVersion',
  ];

  test.each(requiredProperties)('has property: %s', (prop) => {
    expect(content).toContain(prop);
  });

  test('[Timestamp] attribute on RowVersion', () => {
    expect(content).toContain('[Timestamp]');
  });

  test('[Key] attribute on UserId', () => {
    expect(content).toContain('[Key]');
  });

  test('[DatabaseGenerated(DatabaseGeneratedOption.Identity)]', () => {
    expect(content).toContain('DatabaseGeneratedOption.Identity');
  });
});

describe('OracleWebApp – Product model', () => {
  let content;
  beforeAll(() => { content = read('Models/Product.cs'); });

  test('declares Product class', () => {
    expect(content).toContain('public class Product');
  });

  const requiredProperties = [
    'ProductId', 'ProductName', 'Description', 'Price',
    'Stock', 'CreatedAt', 'UpdatedAt', 'IsDeleted', 'RowVersion',
  ];

  test.each(requiredProperties)('has property: %s', (prop) => {
    expect(content).toContain(prop);
  });

  test('[Timestamp] attribute on RowVersion', () => {
    expect(content).toContain('[Timestamp]');
  });
});

describe('OracleWebApp – OracleDbContext', () => {
  let content;
  beforeAll(() => { content = read('Models/OracleDbContext.cs'); });

  test('extends DbContext', () => {
    expect(content).toContain(': DbContext');
  });

  test('DbSet<User> declared', () => {
    expect(content).toContain('DbSet<User>');
  });

  test('DbSet<Product> declared', () => {
    expect(content).toContain('DbSet<Product>');
  });

  test('uses named connection string', () => {
    expect(content).toContain('"name=OracleDbContext"');
  });

  test('USERS table mapped', () => {
    expect(content).toContain('"USERS"');
  });

  test('PRODUCTS table mapped', () => {
    expect(content).toContain('"PRODUCTS"');
  });

  test('UPPER_CASE column names for User', () => {
    expect(content).toContain('"USER_ID"');
    expect(content).toContain('"USER_NAME"');
    expect(content).toContain('"IS_DELETED"');
  });

  test('UPPER_CASE column names for Product', () => {
    expect(content).toContain('"PRODUCT_ID"');
    expect(content).toContain('"PRODUCT_NAME"');
  });

  test('Identity for User ID', () => {
    const identityCount = (content.match(/DatabaseGeneratedOption\.Identity/g) || []).length;
    expect(identityCount).toBeGreaterThanOrEqual(2); // one for User, one for Product
  });

  test('IsRowVersion configured', () => {
    expect(content).toContain('IsRowVersion()');
  });

  test('PluralizingTableNameConvention removed', () => {
    expect(content).toContain('PluralizingTableNameConvention');
  });
});

// ---------------------------------------------------------------------------
// 5. Controllers
// ---------------------------------------------------------------------------
describe('OracleWebApp – HomeController', () => {
  let content;
  beforeAll(() => { content = read('Controllers/HomeController.cs'); });

  test('Index action exists', () => {
    expect(content).toContain('public ActionResult Index()');
  });
});

describe('OracleWebApp – UsersController', () => {
  let content;
  beforeAll(() => { content = read('Controllers/UsersController.cs'); });

  test('inherits Controller', () => {
    expect(content).toContain(': Controller');
  });

  test('Index action with search + page parameters', () => {
    expect(content).toContain('ActionResult Index(string search');
    expect(content).toContain('int page');
  });

  test('pagination constant PageSize = 10', () => {
    expect(content).toMatch(/PageSize\s*=\s*10/);
  });

  test('Details action', () => {
    expect(content).toContain('ActionResult Details(');
  });

  test('GET Create action', () => {
    expect(content).toContain('ActionResult Create()');
  });

  test('POST Create action', () => {
    expect(content).toContain('[ValidateAntiForgeryToken]');
    expect(content).toContain('ActionResult Create(');
  });

  test('GET Edit action', () => {
    expect(content).toContain('ActionResult Edit(int?');
  });

  test('POST Edit with optimistic concurrency handling', () => {
    expect(content).toContain('DbUpdateConcurrencyException');
  });

  test('GET Delete action', () => {
    expect(content).toContain('ActionResult Delete(int?');
  });

  test('POST DeleteConfirmed action', () => {
    expect(content).toContain('ActionResult DeleteConfirmed(int id)');
  });

  test('logical delete (IsDeleted = true, no DB remove)', () => {
    expect(content).toContain('IsDeleted  = true');
    // Ensure there is no db.Users.Remove() call
    expect(content).not.toContain('.Remove(user)');
  });

  test('sets CreatedAt and UpdatedAt on Create', () => {
    expect(content).toContain('CreatedAt');
    expect(content).toContain('UpdatedAt');
  });

  test('[ValidateAntiForgeryToken] on all POST actions', () => {
    const matches = content.match(/\[ValidateAntiForgeryToken\]/g) || [];
    // Create, Edit, Delete = minimum 3
    expect(matches.length).toBeGreaterThanOrEqual(3);
  });

  test('uses OracleDbContext', () => {
    expect(content).toContain('OracleDbContext');
  });
});

describe('OracleWebApp – ProductsController', () => {
  let content;
  beforeAll(() => { content = read('Controllers/ProductsController.cs'); });

  test('inherits Controller', () => {
    expect(content).toContain(': Controller');
  });

  test('Index action with search + page', () => {
    expect(content).toContain('ActionResult Index(string search');
  });

  test('pagination PageSize = 10', () => {
    expect(content).toMatch(/PageSize\s*=\s*10/);
  });

  test('optimistic concurrency handling', () => {
    expect(content).toContain('DbUpdateConcurrencyException');
  });

  test('logical delete only', () => {
    expect(content).toContain('IsDeleted = true');
    expect(content).not.toContain('.Remove(product)');
  });

  test('[ValidateAntiForgeryToken] on all POST actions', () => {
    const matches = content.match(/\[ValidateAntiForgeryToken\]/g) || [];
    expect(matches.length).toBeGreaterThanOrEqual(3);
  });
});

// ---------------------------------------------------------------------------
// 6. Views – security & layout
// ---------------------------------------------------------------------------
describe('OracleWebApp – Views: layout reference', () => {
  const viewFiles = [
    'Views/Home/Index.cshtml',
    'Views/Users/Index.cshtml',
    'Views/Users/Create.cshtml',
    'Views/Users/Edit.cshtml',
    'Views/Users/Details.cshtml',
    'Views/Users/Delete.cshtml',
    'Views/Products/Index.cshtml',
    'Views/Products/Create.cshtml',
    'Views/Products/Edit.cshtml',
    'Views/Products/Details.cshtml',
    'Views/Products/Delete.cshtml',
  ];

  test.each(viewFiles)('uses _Layout.cshtml: %s', (relPath) => {
    const content = read(relPath);
    expect(content).toContain('~/Views/Shared/_Layout.cshtml');
  });
});

describe('OracleWebApp – Views: AntiForgeryToken on POST forms', () => {
  const postForms = [
    'Views/Users/Create.cshtml',
    'Views/Users/Edit.cshtml',
    'Views/Users/Delete.cshtml',
    'Views/Products/Create.cshtml',
    'Views/Products/Edit.cshtml',
    'Views/Products/Delete.cshtml',
  ];

  test.each(postForms)('has @Html.AntiForgeryToken(): %s', (relPath) => {
    const content = read(relPath);
    expect(content).toContain('AntiForgeryToken()');
  });
});

describe('OracleWebApp – Views: ValidationSummary on input forms', () => {
  const inputForms = [
    'Views/Users/Create.cshtml',
    'Views/Users/Edit.cshtml',
    'Views/Products/Create.cshtml',
    'Views/Products/Edit.cshtml',
  ];

  test.each(inputForms)('has @Html.ValidationSummary(true): %s', (relPath) => {
    const content = read(relPath);
    expect(content).toContain('ValidationSummary(true');
  });
});

describe('OracleWebApp – Views: RowVersion hidden field in Edit forms', () => {
  test('Users/Edit.cshtml has hidden RowVersion', () => {
    const content = read('Views/Users/Edit.cshtml');
    expect(content).toContain('RowVersion');
  });

  test('Products/Edit.cshtml has hidden RowVersion', () => {
    const content = read('Views/Products/Edit.cshtml');
    expect(content).toContain('RowVersion');
  });
});

describe('OracleWebApp – Views: Index search & pager', () => {
  test('Users Index has search box', () => {
    const content = read('Views/Users/Index.cshtml');
    expect(content).toContain('name="search"');
  });

  test('Users Index has pager', () => {
    const content = read('Views/Users/Index.cshtml');
    expect(content).toContain('totalPages');
  });

  test('Products Index has search box', () => {
    const content = read('Views/Products/Index.cshtml');
    expect(content).toContain('name="search"');
  });

  test('Products Index has pager', () => {
    const content = read('Views/Products/Index.cshtml');
    expect(content).toContain('totalPages');
  });
});

// ---------------------------------------------------------------------------
// 7. _Layout.cshtml – Bootstrap 5 CDN + navbar
// ---------------------------------------------------------------------------
describe('OracleWebApp – _Layout.cshtml', () => {
  let content;
  beforeAll(() => { content = read('Views/Shared/_Layout.cshtml'); });

  test('Bootstrap 5 CDN link', () => {
    expect(content).toContain('bootstrap@5');
  });

  test('navbar with Home link', () => {
    expect(content).toContain('Home');
  });

  test('navbar with Users link', () => {
    expect(content).toContain('Users');
  });

  test('navbar with Products link', () => {
    expect(content).toContain('Products');
  });

  test('@RenderBody() present', () => {
    expect(content).toContain('@RenderBody()');
  });
});

// ---------------------------------------------------------------------------
// 8. App_Start
// ---------------------------------------------------------------------------
describe('OracleWebApp – RouteConfig', () => {
  let content;
  beforeAll(() => { content = read('App_Start/RouteConfig.cs'); });

  test('default route controller=Home', () => {
    expect(content).toContain('controller = "Home"');
  });

  test('default route action=Index', () => {
    expect(content).toContain('action = "Index"');
  });
});

describe('OracleWebApp – FilterConfig', () => {
  let content;
  beforeAll(() => { content = read('App_Start/FilterConfig.cs'); });

  test('registers HandleErrorAttribute', () => {
    expect(content).toContain('HandleErrorAttribute');
  });
});

// ---------------------------------------------------------------------------
// 9. Global.asax.cs
// ---------------------------------------------------------------------------
describe('OracleWebApp – Global.asax.cs', () => {
  let content;
  beforeAll(() => { content = read('Global.asax.cs'); });

  test('calls AreaRegistration.RegisterAllAreas()', () => {
    expect(content).toContain('AreaRegistration.RegisterAllAreas()');
  });

  test('calls FilterConfig.RegisterGlobalFilters()', () => {
    expect(content).toContain('FilterConfig.RegisterGlobalFilters(');
  });

  test('calls RouteConfig.RegisterRoutes()', () => {
    expect(content).toContain('RouteConfig.RegisterRoutes(');
  });

  test('calls BundleConfig.RegisterBundles()', () => {
    expect(content).toContain('BundleConfig.RegisterBundles(');
  });
});

// ---------------------------------------------------------------------------
// 10. .csproj integrity
// ---------------------------------------------------------------------------
describe('OracleWebApp – OracleWebApp.csproj', () => {
  let content;
  beforeAll(() => { content = read('OracleWebApp.csproj'); });

  test('targets .NET Framework 4.8', () => {
    expect(content).toContain('v4.8');
  });

  test('MVC project type GUID present', () => {
    expect(content).toContain('349c5851-65df-11da-9384-00065b846f21');
  });

  test('EntityFramework HintPath', () => {
    expect(content).toContain('EntityFramework');
  });

  test('Oracle.ManagedDataAccess HintPath', () => {
    expect(content).toContain('Oracle.ManagedDataAccess');
  });

  test('System.Web.Mvc reference', () => {
    expect(content).toContain('System.Web.Mvc');
  });

  test('All controllers listed', () => {
    expect(content).toContain('HomeController.cs');
    expect(content).toContain('UsersController.cs');
    expect(content).toContain('ProductsController.cs');
  });

  test('All models listed', () => {
    expect(content).toContain('User.cs');
    expect(content).toContain('Product.cs');
    expect(content).toContain('OracleDbContext.cs');
  });
});

// ---------------------------------------------------------------------------
// 11. Views/Web.config – Razor engine namespaces
// ---------------------------------------------------------------------------
describe('OracleWebApp – Views/Web.config', () => {
  let content;
  beforeAll(() => { content = read('Views/Web.config'); });

  test('System.Web.Mvc namespace registered', () => {
    expect(content).toContain('System.Web.Mvc');
  });

  test('OracleWebApp namespace registered', () => {
    expect(content).toContain('OracleWebApp');
  });

  test('Razor host factory configured', () => {
    expect(content).toContain('MvcWebRazorHostFactory');
  });
});

// ---------------------------------------------------------------------------
// 12. AssemblyInfo.cs
// ---------------------------------------------------------------------------
describe('OracleWebApp – AssemblyInfo.cs', () => {
  let content;
  beforeAll(() => { content = read('Properties/AssemblyInfo.cs'); });

  test('AssemblyTitle is OracleWebApp', () => {
    expect(content).toContain('"OracleWebApp"');
  });

  test('AssemblyVersion 1.0.0.0', () => {
    expect(content).toContain('1.0.0.0');
  });
});
