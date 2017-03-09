#include <iostream>
#include <QImage>
#include <QFile>
#include <QByteArray>
#include <QTextStream>
#include <QColor>
#include <QFileInfo>
#include <QVector>
#include <cmath>



QByteArray readFile(QString name) {
    QFile file(name);
    if (!file.open(QFile::ReadOnly)) {
        return QByteArray();
    }
    
    QByteArray res = file.readAll();
    file.close();
    return res;    
}




// this is the accurate way to convert textures !
void createSimpleTexture(QString fileName, QImage& image) {
    QByteArray texData = readFile(fileName);
    int width = image.width();
    if (!texData.isEmpty()) {        
        for (int i=0; i < texData.size(); i++) {
            image.setPixel( 
                (i % width),
                (i / width),
                (unsigned char)texData[i]
            );
        } 
    }
}

// we create a new function that, to be usable, will use a palette, a filename
// and produce and write down a texture.

void setupAndSaveImage(QFileInfo fileInfo, const QVector<QRgb>& palette) {
    int width, height;
    QString fileName = fileInfo.fileName();
    
    if (!fileInfo.exists()) {
        std::cerr << qPrintable(fileName) << " not found." << std::endl;
        return;
    }

    if (fileInfo.size() == 64000) {
        width = 320;
        height = 200;            
    } else {
        int side = sqrt(fileInfo.size());
        
        if (side * side == fileInfo.size()) {
            width = height = side;
        } else {
            std::cerr << "Cannot handle this texture size." << std::endl;
            return ;
        }
    }
            
    QImage finalTexture = QImage(width,height,QImage::Format_Indexed8);
    finalTexture.setColorTable(palette);
    createSimpleTexture(fileName, finalTexture);        
    finalTexture.save(fileName  +".png");    
}


void createTextures(QString fileName,const QVector<QRgb>& palette) {
    QFile file(fileName);
    if (!file.open(QFile::ReadOnly)) {
        return;
    }
    QTextStream textFile(&file);    
    int numTextures ;    
    textFile >> numTextures;
    
    for(int p = 0; p < numTextures; p++) {
        QString fileTexture;
        textFile >> fileTexture;
        QFileInfo fileInfo(fileTexture);
        
        setupAndSaveImage(fileInfo, palette);
        
    }
}



void usage(char* name) {
    std::cout << "usage: " << name << " texturelist.{TEX|RAW} texturepalette.ACT" << std::endl;   
}


int main(int argc, char* argv[]) {
    if (argc != 3) {
        usage(argv[0]);
        return 1;
    }

    // let's read palette files.
    QByteArray paletteData = readFile(QString(argv[2]));
    if (paletteData.isEmpty()) {
        std::cerr << "Could not read palette file." << std::endl;
        return 2;        
    }
    QVector<QRgb> palette;
    
    for (int i = 0; i< 256*3 ; i+=3) {
        palette.push_back(qRgb(paletteData[i], paletteData[i+1], paletteData[i+2]));        
    }

    QString fileName(argv[1]);
    
    QFileInfo fileInfo(fileName);
    if (fileInfo.suffix() == "TEX") {
        createTextures(fileName, palette);
    } else {
        setupAndSaveImage(fileInfo, palette);
    }
    return 0;
}