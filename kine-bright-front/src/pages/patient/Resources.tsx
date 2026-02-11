import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Video, ExternalLink, Calendar, User, Tag, ArrowLeft, Play, Clock, Star } from 'lucide-react';
import { resourceService, RessourceEducative } from '@/api/resource.service';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getYouTubeThumbnail } from '@/lib/utils';

const ResourcesPage = () => {
  const [resources, setResources] = useState<RessourceEducative[]>([]);
  const [filteredResources, setFilteredResources] = useState<RessourceEducative[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredResources(resources);
    } else {
      const lowerTerm = searchTerm.toLowerCase();
      const filtered = resources.filter(r =>
        r.titre.toLowerCase().includes(lowerTerm) ||
        (r.contenu && r.contenu.toLowerCase().includes(lowerTerm)) ||
        (r.description && r.description.toLowerCase().includes(lowerTerm)) ||
        (r.tags && r.tags.some(tag => tag.toLowerCase().includes(lowerTerm)))
      );
      setFilteredResources(filtered);
    }
  }, [searchTerm, resources]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const data = await resourceService.getAll();
      setResources(data);
      setFilteredResources(data);
    } catch (error) {
      console.error("Failed to fetch resources:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter resources into categories
  const allArticles = filteredResources
    .filter(r => r.type === 'article')
    .sort((a, b) => {
      // Prioritize featured articles
      if (a.misEnAvant && !b.misEnAvant) return -1;
      if (!a.misEnAvant && b.misEnAvant) return 1;
      // Then sort by date
      return new Date(b.datePublication).getTime() - new Date(a.datePublication).getTime();
    });

  const featuredArticle = allArticles[0];
  const articlesArticles = allArticles.slice(1);
  const videos = filteredResources.filter(r => r.type === 'video');

  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const dailyTips = [
    {
      title: "Hydratation et Récupération",
      content: "Buvez au moins 8 verres d'eau par jour pour optimiser votre récupération musculaire et maintenir la flexibilité de vos tissus. L'hydratation est essentielle pour transporter les nutriments vers vos muscles en cours de guérison."
    },
    {
      title: "Posture au Bureau",
      content: "Réglez votre écran à la hauteur de vos yeux pour éviter les tensions cervicales. Gardez vos pieds à plat au sol et le dos bien droit contre le dossier de votre chaise."
    },
    {
      title: "L'importance du Sommeil",
      content: "Un sommeil réparateur de 7 à 8 heures est crucial pour la guérison tissulaire. C'est durant la nuit que votre corps produit le plus d'hormones de croissance, essentielles à la réparation des tissus."
    },
    {
      title: "Échauffement avant l'effort",
      content: "Prenez toujours 10 minutes pour vous échauffer avant une activité physique. Cela augmente la température musculaire et prépare vos articulations, réduisant ainsi le risque de blessure."
    },
    {
      title: "Gestion du Stress",
      content: "Le stress chronique peut augmenter la perception de la douleur et ralentir la guérison. Pratiquez 5 minutes de respiration profonde par jour pour activer votre système nerveux parasympathique."
    },
    {
      title: "Alimentation Anti-inflammatoire",
      content: "Incorporez des aliments riches en oméga-3 (poissons gras, noix) et en antioxydants (fruits rouges, légumes verts) pour aider votre corps à gérer l'inflammation naturellement."
    },
    {
      title: "Écoute de son Corps",
      content: "La douleur est un signal. Si un mouvement provoque une douleur aiguë (différente de l'effort musculaire), arrêtez-vous. 'No pain, no gain' ne s'applique pas à la rééducation !"
    },
    {
      title: "Régularité des Exercices",
      content: "Mieux vaut faire 15 minutes d'exercices de rééducation tous les jours que 2 heures une fois par semaine. La régularité est la clé de la neuroplasticité et du renforcement."
    },
    {
      title: "Chaussures Adaptées",
      content: "Portez des chaussures qui soutiennent correctement votre voûte plantaire, même à la maison. Une bonne base d'appui soulage les genoux, les hanches et le dos."
    },
    {
      title: "Pauses Actives",
      content: "Si vous travaillez assis, levez-vous toutes les heures pour marcher 2 minutes ou vous étirer. Le mouvement favorise la circulation sanguine et l'oxygénation des tissus."
    }
  ];

  const currentTip = dailyTips[currentTipIndex];

  const handleNextTip = () => {
    setCurrentTipIndex((prevIndex) => (prevIndex + 1) % dailyTips.length);
  };

  return (
    <>
      <div className="min-h-screen bg-background py-6 px-4 md:px-6">
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">

          {/* Top Navigation */}
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au tableau de bord
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ressources Éducatives
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8 text-lg">
              Découvrez nos ressources pour vous accompagner dans votre parcours de rééducation.
              Articles, vidéos et conseils pratiques pour optimiser votre récupération.
            </p>

            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des ressources..."
                className="pl-10 h-11 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-8">
              <div className="h-96 bg-muted animate-pulse rounded-xl" />
              <div className="grid md:grid-cols-2 gap-6">
                <div className="h-64 bg-muted animate-pulse rounded-xl" />
                <div className="h-64 bg-muted animate-pulse rounded-xl" />
              </div>
            </div>
          ) : (
            <>
              {searchTerm ? (
                /* Unified Search Results Section */
                <section className="mb-12">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-foreground">
                      Résultats de recherche ({filteredResources.length})
                    </h2>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResources.length > 0 ? filteredResources.map((resource) => (
                      <Card key={resource._id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer h-full" onClick={() => {
                        if (resource.type === 'video' && resource.url) {
                          window.open(resource.url, '_blank');
                        } else {
                          window.location.href = `/resources/${resource._id}`;
                        }
                      }}>
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={resource.imageUrl || (resource.type === 'video' ? getYouTubeThumbnail(resource.url) : "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop") || "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=250&fit=crop"}
                            alt={resource.titre}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          {resource.type === 'video' && (
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                <Play className="h-5 w-5 text-white ml-1 fill-white" />
                              </div>
                            </div>
                          )}
                          <Badge className={`absolute top-3 left-3 border-none backdrop-blur-sm ${resource.type === 'video' ? 'bg-black/60 text-white' : 'bg-white/90 text-foreground'}`}>
                            {resource.tags?.[0] || (resource.type === 'video' ? 'Vidéo' : 'Article')}
                          </Badge>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-2 leading-tight">
                            {resource.titre}
                          </h3>
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                            {resource.description || resource.contenu}
                          </p>
                          <div className="flex items-center text-sm text-muted-foreground mb-4 gap-4">
                            {resource.type === 'article' && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(resource.datePublication), 'd MMM yyyy', { locale: fr })}
                              </span>
                            )}
                          </div>
                          <Button className={`w-full transition-colors ${resource.type === 'video' ? 'bg-red-600 hover:bg-red-700 text-white' : 'variant-outline group-hover:bg-primary group-hover:text-primary-foreground'}`} onClick={(e) => {
                            e.stopPropagation();
                            if (resource.type === 'video' && resource.url) {
                              window.open(resource.url, '_blank');
                            } else {
                              window.location.href = `/resources/${resource._id}`;
                            }
                          }}>
                            {resource.type === 'video' ? <Play className="h-4 w-4 mr-2" /> : <BookOpen className="h-4 w-4 mr-2" />}
                            {resource.type === 'video' ? 'Regarder sur YouTube' : 'Lire la suite'}
                          </Button>
                        </CardContent>
                      </Card>
                    )) : (
                      <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                        Aucun résultat trouvé pour "{searchTerm}".
                      </div>
                    )}
                  </div>
                </section>
              ) : (
                <>
                  {/* Featured Article */}
                  {featuredArticle && (
                    <div role="button" tabIndex={0} className="block mb-12 focus:outline-none" onClick={() => window.location.href = `/resources/${featuredArticle._id}`} onKeyDown={(e) => e.key === 'Enter' && (window.location.href = `/resources/${featuredArticle._id}`)}>
                      <Card className="overflow-hidden border-l-4 border-l-primary hover:shadow-md transition-shadow cursor-pointer h-full">
                        <div className="flex flex-col md:flex-row h-full">
                          <div className="md:w-2/5 relative min-h-[250px] md:min-h-full">
                            <img
                              src={featuredArticle.imageUrl || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop"}
                              alt={featuredArticle.titre}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          </div>
                          <div className="md:w-3/5 p-8 flex flex-col justify-center">
                            <div className="flex gap-2 mb-4">
                              <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">
                                Article vedette
                              </Badge>
                              <Badge variant="outline">{featuredArticle.tags?.[0] || 'Rééducation'}</Badge>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">
                              {featuredArticle.titre}
                            </h2>
                            <p className="text-muted-foreground mb-6 line-clamp-3 text-lg leading-relaxed">
                              {featuredArticle.description || featuredArticle.contenu}
                            </p>
                            <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                              <span className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                5 min
                              </span>
                              <span className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                Débutant
                              </span>
                            </div>
                            <Button className="w-fit" onClick={(e) => {
                              e.stopPropagation();
                              if (featuredArticle.type === 'video' && featuredArticle.url) {
                                window.open(featuredArticle.url, '_blank');
                              } else {
                                window.location.href = `/resources/${featuredArticle._id}`;
                              }
                            }}>
                              {featuredArticle.type === 'video' ? <Play className="h-4 w-4 mr-2" /> : <BookOpen className="h-4 w-4 mr-2" />}
                              {featuredArticle.type === 'video' ? "Regarder la vidéo" : "Lire l'article"}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}

                  {/* Articles Section */}
                  <section className="mb-12">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-foreground">Articles Recommandés</h2>

                    </div>
                    <ScrollArea className="h-[800px] pr-4">
                      <div className="grid md:grid-cols-2 gap-8">
                        {articlesArticles.length > 0 ? articlesArticles.map((article) => (
                          <div key={article._id} role="button" tabIndex={0} className="block focus:outline-none" onClick={() => window.location.href = `/resources/${article._id}`} onKeyDown={(e) => e.key === 'Enter' && (window.location.href = `/resources/${article._id}`)}>
                            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer h-full">
                              <div className="relative h-56 overflow-hidden">
                                <img
                                  src={article.imageUrl || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop"}
                                  alt={article.titre}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <Badge className="absolute top-4 left-4 bg-white/90 text-foreground shadow-sm hover:bg-white">
                                  {article.tags?.[0] || 'Article'}
                                </Badge>
                              </div>
                              <CardContent className="p-6">
                                <h3 className="font-bold text-xl text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                                  {article.titre}
                                </h3>
                                <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
                                  {article.description || article.contenu}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    8 min
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {format(new Date(article.datePublication), 'd MMM yyyy', { locale: fr })}
                                  </span>
                                </div>
                                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                  <BookOpen className="h-4 w-4 mr-2" />
                                  Lire la suite
                                </Button>
                              </CardContent>
                            </Card>
                          </div>
                        )) : (
                          <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                            Aucun autre article recommandé pour le moment.
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </section>

                  {/* Videos Section */}
                  <section className="mb-12">
                    <div className="flex justify-between items-center mb-6 my-16">
                      <h2 className="text-2xl font-bold text-foreground">Vidéos Éducatives</h2>
                    </div>
                    <ScrollArea className="h-[800px] pr-4">
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {videos.length > 0 ? videos.map((video) => (
                          <Card key={video._id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer" onClick={() => window.location.href = `/resources/${video._id}`}>
                            <div className="relative h-48 overflow-hidden">
                              <img
                                src={video.imageUrl || getYouTubeThumbnail(video.url) || "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=250&fit=crop"}
                                alt={video.titre}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                  <Play className="h-5 w-5 text-white ml-1 fill-white" />
                                </div>
                              </div>
                              <Badge className="absolute top-3 left-3 bg-black/60 text-white border-none backdrop-blur-sm">
                                {video.tags?.[0] || 'Vidéo'}
                              </Badge>
                              <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm font-medium">
                                10:00
                              </span>
                            </div>
                            <CardContent className="p-4">
                              <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-2 leading-tight">
                                {video.titre}
                              </h3>
                              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                                {video.description}
                              </p>
                              <Button className="w-full bg-red-600 hover:bg-red-700 text-white transition-colors" onClick={(e) => { e.stopPropagation(); if (video.url) window.open(video.url, '_blank'); }}>
                                <Play className="h-4 w-4 mr-2" />
                                Regarder sur YouTube
                              </Button>
                            </CardContent>
                          </Card>
                        )) : (
                          <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                            Aucune vidéo disponible pour le moment.
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </section>

                  {/* Daily Tip */}
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-8 text-center">
                      <h2 className="text-2xl font-bold text-foreground mb-3 flex justify-center items-center gap-2">
                        <span className="bg-primary text-primary-foreground rounded-full p-1"><Star className="h-4 w-4 fill-current" /></span>
                        Conseil du Jour
                      </h2>
                      <p className="text-muted-foreground mb-6">
                        Intégrez ces habitudes simples dans votre routine quotidienne
                      </p>
                      <div className="bg-background rounded-xl p-6 mb-6 shadow-sm border border-border inline-block max-w-2xl mx-auto text-left">
                        <h3 className="font-bold text-lg text-foreground mb-2 text-center">{currentTip.title}</h3>
                        <p className="text-muted-foreground leading-relaxed text-center">
                          {currentTip.content}
                        </p>
                      </div>
                      <div>
                        <Button variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors" onClick={handleNextTip}>
                          Découvrir plus de conseils
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </>
          )}

        </div>
      </div>
    </>
  );
};

export default ResourcesPage;
