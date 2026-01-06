import React, { useEffect, useState } from 'react';
import Layout from "@/components/layout/Layout";
import { ArrowLeft, Clock, Calendar, User, Tag } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { resourceService } from '@/api/resource.service';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await resourceService.getById(id);
        setArticle(data);
      } catch (error) {
        console.error("Failed to fetch article", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background py-6 px-4 md:px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="h-96 w-full bg-muted animate-pulse rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 bg-muted animate-pulse rounded" />
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="min-h-screen bg-background py-6 px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Article non trouvé</h1>
            <Link to="/resources" className="text-primary hover:underline">
              Retour aux ressources
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Parse sections if content is stored as JSON string, otherwise treat as simple string
  // For compatibility with the simple string model we have:
  const isRichContent = (article.contenu || '').includes('"sections":');
  // Ideally, we'd update the backend to store structured data, but for now we might parse or just show text.
  // Wait, the reference `ArticleDetail` expects `sections` array.
  // User wants "content like this article".
  // I will assume for the Seeded data, I will put JSON in the content field or simple text?
  // Let's support simple string with newlines for now to match current model, 
  // OR update the component to split by double newline like the reference does for "Scraping" text if it's a single block.

  const contentParagraphs = (article.contenu || '').split('\n\n');

  return (
    <Layout>
      <div className="min-h-screen bg-background py-8 px-4 md:px-6">
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
          {/* Back link */}
          <Link
            to="/resources"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Retour aux ressources
          </Link>

          {/* Header Meta */}
          <div className="mb-6 flex flex-wrap gap-4 items-center text-sm">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
              {article.type === 'video' ? 'Vidéo' : 'Article'}
            </span>
            <div className="flex items-center text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              {format(new Date(article.datePublication), 'd MMMM yyyy', { locale: fr })}
            </div>
            {typeof article.auteurId === 'object' && (
              <div className="flex items-center text-muted-foreground">
                <User className="h-4 w-4 mr-2" />
                Dr. {article.auteurId.prenom} {article.auteurId.nom}
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-8 leading-tight">
            {article.titre}
          </h1>

          {/* Hero Image */}
          {article.imageUrl && (
            <div className="rounded-2xl overflow-hidden mb-10 shadow-lg relative aspect-video">
              <img
                src={article.imageUrl}
                alt={article.titre}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Content */}
          <article className="prose prose-lg prose-slate max-w-none dark:prose-invert">
            {contentParagraphs.map((paragraph: string, index: number) => {
              // Simple header detection style for now
              if (paragraph.startsWith('# ')) {
                return <h2 key={index} className="text-2xl font-bold text-pink-600 mt-8 mb-4">{paragraph.replace('# ', '')}</h2>
              }
              return (
                <p key={index} className="text-foreground/90 leading-relaxed mb-6 text-lg">
                  {paragraph}
                </p>
              )
            })}
          </article>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-2">
              {article.tags.map((tag: string) => (
                <span key={tag} className="flex items-center text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  <Tag className="h-3 w-3 mr-2" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ArticleDetail;
