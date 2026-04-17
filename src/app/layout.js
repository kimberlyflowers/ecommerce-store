import './globals.css';

export const metadata = {
  title: 'Ring Marketplace | Fine Engagement Rings',
  description: 'Discover exquisite engagement rings from trusted jewelers. Browse solitaire, halo, vintage, and custom designs.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <a href="/" className="logo">RING MARKETPLACE</a>
          <nav className="nav">
            <a href="/shop">Shop</a>
            <a href="/shop?category=solitaire">Solitaire</a>
            <a href="/shop?category=halo">Halo</a>
            <a href="/shop?category=vintage">Vintage</a>
            <a href="/vendor-portal">Vendors</a>
          </nav>
        </header>
        {children}
        <footer className="footer">
          <div className="footer-grid">
            <div>
              <h4>Ring Marketplace</h4>
              <p>Connecting you with the world&apos;s finest jewelers. Every ring tells a story of craftsmanship, beauty, and eternal love.</p>
            </div>
            <div>
              <h4>Shop</h4>
              <a href="/shop?category=solitaire">Solitaire</a><br/>
              <a href="/shop?category=halo">Halo</a><br/>
              <a href="/shop?category=vintage">Vintage</a><br/>
              <a href="/shop?category=three-stone">Three Stone</a><br/>
              <a href="/shop?category=pave">Pav&eacute;</a>
            </div>
            <div>
              <h4>Company</h4>
              <a href="/vendor-portal">Become a Vendor</a><br/>
              <a href="#">About Us</a><br/>
              <a href="#">Contact</a><br/>
              <a href="#">Privacy Policy</a>
            </div>
            <div>
              <h4>Support</h4>
              <a href="#">Sizing Guide</a><br/>
              <a href="#">Shipping Info</a><br/>
              <a href="#">Returns</a><br/>
              <a href="#">FAQ</a>
            </div>
          </div>
          <div className="footer-bottom">
            &copy; {new Date().getFullYear()} Ring Marketplace. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
