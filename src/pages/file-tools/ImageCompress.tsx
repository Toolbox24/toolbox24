import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Download, ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/hooks/useLanguage';
import { Helmet } from 'react-helmet-async';

const ImageCompress = () => {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<number[]>([0.8]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();
  const { getLocalizedPath } = useLanguage();

  const handleFileSelect = (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) {
      // Reset all states when file is removed
      setFile(null);
      setPreviewUrl(null);
      setDownloadUrl(null);
      setOriginalSize(0);
      setCompressedSize(0);
      setProgress(0);
      setIsProcessing(false);
      return;
    }
    
    if (selectedFiles.length > 0) {
      const selectedFile = selectedFiles[0];
      setFile(selectedFile);
      setOriginalSize(selectedFile.size);
      setDownloadUrl(null);
      setCompressedSize(0);
      setProgress(0);
      setIsProcessing(false);
      
      // Create preview
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const compressImage = async () => {
    if (!file) {
      toast({
        title: t('common.error'),
        description: t('tools.imageCompress.errors.selectImage'),
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        initialQuality: quality[0],
        onProgress: (progress: number) => {
          setProgress(Math.round(progress));
        }
      };

      const compressedFile = await imageCompression(file, options);
      setCompressedSize(compressedFile.size);

      const url = URL.createObjectURL(compressedFile);
      setDownloadUrl(url);

      toast({
        title: t('common.success'),
        description: t('tools.imageCompress.success')
      });
    } catch (error) {
      console.error('Error compressing image:', error);
      toast({
        title: t('common.error'),
        description: t('tools.imageCompress.errors.compressError'),
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadCompressedImage = () => {
    if (downloadUrl && file) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `compressed-${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSavingsPercentage = () => {
    if (originalSize && compressedSize) {
      const savings = ((originalSize - compressedSize) / originalSize) * 100;
      return Math.max(0, savings);
    }
    return 0;
  };

  return (
    <div className="min-h-screen py-8">
      <Helmet>
        <title>{t('tools.imageCompress.title')} - Toolbox24</title>
        <meta name="description" content={t('tools.imageCompress.description')} />
      </Helmet>
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="page-header">
          <h1 className="page-title flex items-center justify-center gap-2">
            <ImageIcon className="h-8 w-8 text-primary" />
            {t('tools.imageCompress.title')}
          </h1>
          <p className="page-description">
            {t('tools.imageCompress.description')}
          </p>
        </div>

        <div className="space-y-6">
          <FileUpload
            onFileSelect={handleFileSelect}
            accept={{ 
              'image/jpeg': ['.jpg', '.jpeg'],
              'image/png': ['.png'],
              'image/webp': ['.webp'],
              'image/svg+xml': ['.svg'],
              'image/gif': ['.gif']
            }}
            multiple={false}
            maxSize={50 * 1024 * 1024} // 50MB
          />

          {file && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {previewUrl && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{t('common.original')}</h3>
                  <img 
                    src={previewUrl} 
                    alt="Original" 
                    className="w-full h-64 object-cover rounded border"
                  />
                  <p className="text-sm text-muted-foreground">
                    {t('common.size')}: {formatFileSize(originalSize)}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label>{t('tools.imageCompress.qualityLabel')}: {Math.round(quality[0] * 100)}%</Label>
                  <Slider
                    value={quality}
                    onValueChange={setQuality}
                    max={1}
                    min={0.1}
                    step={0.1}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('tools.imageCompress.qualityHint')}
                  </p>
                </div>

                <Button
                  onClick={compressImage}
                  disabled={isProcessing}
                  size="lg"
                  className="w-full"
                >
                  {isProcessing ? t('common.processing') : t('tools.imageCompress.button')}
                </Button>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="text-center text-sm text-muted-foreground">
                {t('common.processing')} {progress}%
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {downloadUrl && (
            <div className="text-center p-6 bg-muted/50 rounded-lg border">
              <h3 className="text-lg font-semibold mb-2 text-green-600">
                {t('tools.imageCompress.success')}
              </h3>
              <div className="text-sm text-muted-foreground mb-4 space-y-1">
                <p>{t('common.originalSize')}: {formatFileSize(originalSize)}</p>
                <p>{t('common.compressedSize')}: {formatFileSize(compressedSize)}</p>
                <p className="font-semibold text-green-600">
                  {t('common.savings')}: {getSavingsPercentage().toFixed(1)}%
                </p>
              </div>
              <Button
                onClick={downloadCompressedImage}
                size="lg"
                className="w-full max-w-md"
              >
                <Download className="mr-2 h-4 w-4" />
                {t('tools.imageCompress.downloadButton')}
              </Button>
            </div>
          )}
        </div>

        <div className="mt-12 p-6 bg-muted/30 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">{t('common.howItWorks')}</h2>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            {(t('tools.imageCompress.instructions', { returnObjects: true }) as string[]).map((instruction: string, index: number) => (
              <li key={index}>{instruction}</li>
            ))}
          </ol>
          <p className="text-sm text-muted-foreground mt-4">
            <strong>{t('common.privacy')}</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageCompress;