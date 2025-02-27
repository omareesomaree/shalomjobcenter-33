
import React, { useEffect, useState } from 'react';
import { useListings } from '@/hooks/useListings';
import { Navbar } from '@/components/Navbar';
import { ListingCard } from '@/components/ListingCard';
import { CategoryFiltersSimplified } from '@/components/CategoryFiltersSimplified';
import { Briefcase, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Listing } from '@/types/listing';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { listings, isLoading } = useListings();
  const { settings } = useSiteSettings();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  
  // Exemples d'URLs d'images de remplacement fiables
  const placeholderImages = [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800", // Maison moderne
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800", // Maison élégante
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800", // Logement lumineux
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", // Intérieur moderne
    "https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?w=800"  // Appartement contemporain
  ];

  // Fonction pour vérifier si une URL d'image est valide ou s'il s'agit d'une URL blob
  const getValidImageUrl = (imageUrl: string, index: number) => {
    if (!imageUrl || imageUrl.startsWith('blob:')) {
      return placeholderImages[index % placeholderImages.length];
    }
    return imageUrl;
  };

  // Filtrer les listings en fonction du terme de recherche
  useEffect(() => {
    if (!listings) return;
    
    if (!searchTerm.trim()) {
      // Si aucun terme de recherche, afficher tous les listings avec des images corrigées
      const processed = listings.map((listing, index) => ({
        ...listing,
        image: getValidImageUrl(listing.image, index),
        images: listing.images ? 
          listing.images.map((img, imgIndex) => getValidImageUrl(img, index + imgIndex)) : 
          [getValidImageUrl(listing.image, index)]
      }));
      setFilteredListings(processed);
    } else {
      // Filtrer par terme de recherche
      const filtered = listings.filter(listing => 
        listing.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.title.toLowerCase().includes(searchTerm.toLowerCase())
      ).map((listing, index) => ({
        ...listing,
        image: getValidImageUrl(listing.image, index),
        images: listing.images ? 
          listing.images.map((img, imgIndex) => getValidImageUrl(img, index + imgIndex)) : 
          [getValidImageUrl(listing.image, index)]
      }));
      setFilteredListings(filtered);
    }
  }, [listings, searchTerm]);

  // Affichage du prix en FCFA
  const formatPriceFCFA = (priceEUR: number): string => {
    const priceFCFA = Math.round(priceEUR * 655.957);
    return priceFCFA.toLocaleString('fr-FR');
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20">
        <CategoryFiltersSimplified />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Bannière pour les offres d'emploi */}
          <div 
            className="bg-gradient-to-r rounded-lg mb-10 shadow-md overflow-hidden"
            style={{ 
              background: `linear-gradient(to right, ${settings.primaryColor}, ${settings.secondaryColor})` 
            }}
          >
            <div className="md:flex items-center">
              <div className="p-8 md:w-2/3">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Découvrez nos offres d'emploi
                </h2>
                <p className="text-white opacity-80 mb-6">
                  Des opportunités dans la sécurité et des logements exclusifs pour nos employés
                </p>
                <Link
                  to="/emplois"
                  className="inline-flex items-center bg-white text-blue-700 font-semibold px-6 py-3 rounded-md shadow hover:bg-blue-50 transition"
                  style={{ color: settings.primaryColor }}
                >
                  <Briefcase className="mr-2 h-5 w-5" />
                  Voir les offres
                </Link>
              </div>
              <div className="md:w-1/3 p-6 flex justify-center">
                <div className="bg-white bg-opacity-20 p-6 rounded-full">
                  <Briefcase className="h-24 w-24 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher par quartier, titre..."
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                style={{ 
                  borderColor: settings.primaryColor,
                  boxShadow: `0 0 0 0px ${settings.primaryColor}`
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {searchTerm && (
              <Button 
                onClick={() => setSearchTerm("")}
                variant="outline"
                className="whitespace-nowrap"
              >
                Effacer la recherche
              </Button>
            )}
          </div>

          <h1 className="text-3xl font-bold mb-6">{settings.siteName || "Logements disponibles"}</h1>
          
          {/* Affichage des résultats de recherche */}
          {searchTerm && (
            <p className="mb-6 text-gray-600">
              {filteredListings.length} résultat(s) pour "{searchTerm}"
            </p>
          )}
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div
                  key={index}
                  className="bg-gray-200 animate-pulse rounded-lg h-64"
                ></div>
              ))}
            </div>
          ) : filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-xl text-gray-500">Aucun logement ne correspond à votre recherche</p>
              {searchTerm && (
                <Button 
                  onClick={() => setSearchTerm("")}
                  className="mt-4"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  Voir tous les logements
                </Button>
              )}
            </div>
          )}
          
          {/* Liste des quartiers populaires */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Quartiers populaires à Lomé</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Tokoin', 'Bè', 'Adidogomé', 'Agoè', 'Kodjoviakopé', 'Nyékonakpoè', 'Hédzranawoé', 'Baguida'].map(neighborhood => (
                <Button 
                  key={neighborhood}
                  variant="outline"
                  className="py-6 text-lg justify-start"
                  onClick={() => setSearchTerm(neighborhood)}
                >
                  {neighborhood}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pied de page avec les informations configurables */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Logo et informations de l'entreprise */}
            <div className="space-y-4">
              <img 
                src={settings.logo || "/placeholder.svg"} 
                alt={settings.siteName} 
                className="h-12 w-auto bg-white p-2 rounded"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
              <h3 className="text-xl font-bold">{settings.siteName}</h3>
              <p className="text-gray-400 text-sm">{settings.footer.about}</p>
            </div>
            
            {/* Contact */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <div className="text-gray-400 space-y-2">
                <p>{settings.footer.contact}</p>
                {settings.companyInfo && (
                  <>
                    <p>{settings.companyInfo.address}</p>
                    <p>{settings.companyInfo.phone}</p>
                    <p>{settings.companyInfo.email}</p>
                  </>
                )}
              </div>
            </div>
            
            {/* Informations légales */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Informations légales</h4>
              <div className="text-gray-400 space-y-2">
                <p>{settings.footer.terms}</p>
                <p>{settings.footer.policy}</p>
                {settings.companyInfo && (
                  <p>RCCM: {settings.companyInfo.registrationNumber}</p>
                )}
              </div>
            </div>
            
            {/* Réseaux sociaux */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Suivez-nous</h4>
              <div className="flex space-x-4">
                <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href={settings.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
