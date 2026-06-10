export const metadata = {
  title: "Search | Mobile Accessories",
  description: "Search for mobile accessories, brands, and categories.",
};

export default function SearchPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 w-full min-h-[60vh] flex flex-col items-center justify-center text-center">
      <div className="mb-8 w-full max-w-md mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Search</h1>
        <p className="text-muted-foreground mb-8">
          Looking for something specific? Search functionality is coming soon.
        </p>
        
        <div className="flex w-full items-center space-x-2">
          <input 
            type="text" 
            placeholder="Search products..." 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled
          />
          <button 
            type="button" 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            disabled
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
