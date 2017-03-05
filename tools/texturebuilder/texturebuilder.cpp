#include <iostream>
#include <QImage>
#include <QFile>
#include <QByteArray>
#include <QTextStream>
#include <QColor>



QByteArray readFile(QString name) {
    QFile file(name);
    if (!file.open(QFile::ReadOnly)) {
        return QByteArray();
    }
    
    QByteArray res = file.readAll();
    file.close();
    return res;    
}



void createTexture(QString fileName, QRgb palette[256], QImage& image) {
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
        
        QByteArray texData = readFile(fileTexture);
        if (!texData.isEmpty()) {
            int s = (15 - p / 16) * 64;
            int r = (p % 16) * 64;
            
            // pb: some textures are bigger than 4096 bytes !
            if (texData.size() == 4096) {
                for (int i=0; i < 4096; i++) {
                    image.setPixel( 
                        r + (i / 64),
                        s + (i % 64),
                        palette[(unsigned char)texData[i]]
                    );
                    //std::cout << (int)texData[i] << std::endl;
                }
            } else {
                if (texData.size() == 65536) {
                    for (int i=0; i < 64; i++) {
                        for (int j=0; j < 64; j++) {
                            image.setPixel( 
                                r + (i),
                                s + (j),
                                palette[(unsigned char)texData[i*1024+j*4]]
                            );
                        }
                    }
                }
            }
        }        
    }
}



void usage(char* name) {
    std::cout << "usage: " << name << " texturelist.TEX texturepalette.ACT" << std::endl;   
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
    QRgb palette[256];
    
    for (int i = 0; i< 256*3 ; i+=3) {
        palette[i/3] = qRgb(paletteData[i], paletteData[i+1], paletteData[i+2]);        
    }
    // palette is now stored

    QImage finalTexture(1024,1024,QImage::Format_RGB32);

    // let's read list of textures
    createTexture(QString(argv[1]), palette, finalTexture);
    finalTexture.save(QString(argv[1])+".png");
    return 0;
}