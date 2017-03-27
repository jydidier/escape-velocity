#include "levelfile.h"

#include <QTextStream>
#include <QJsonArray>
#include <QJsonDocument>
#include <units.h>
#include <iostream>
#include <txtfile.h>
#include <texfile.h>
#include <pupfile.h>
#include <tdffile.h>
#include <deffile.h>
#include <navfile.h>
#include <tnlfile.h>
#include <rawfile.h>
#include <actfile.h>
#include <QDir>

int LevelFile::fileTypeId = PodFile::registerLoader("LVL", fileLoader<LevelFile>);

LevelFile::LevelFile(PodArchive &arch, QString path) :
    PodFile(arch, path), filePath(path)
{
    QTextStream ts(data, QIODevice::ReadOnly);
    QStringList sl;
    QString line;

    filePath.replace('\\', QDir::separator());

    int type = ts.readLine().toInt();
    level["type"] = type;

    level["briefing"] = line = ts.readLine();
    deps << line;
    if (type == 4) {
        level["heightmap"] = line = ts.readLine();
        deps << line;
    } else {
        level["tunnel"] = line = ts.readLine();
        deps << line;
    }
    line = ts.readLine();
    if (type == 4) {
        level["texturePlacement"] = line;
        deps << line;
    }

    paletteFile = ts.readLine();
    deps << paletteFile;
    level["textures"] = line = ts.readLine();
    deps << line;

    // for reading qke
    ts.readLine();

    level["powerups"] = line = ts.readLine();
    deps << line;
    level["animation"] = line = ts.readLine();
    deps << line;
    level["tunnelDefinition"] = line = ts.readLine();
    deps << line;
    level["clouds"] = line = ts.readLine();
    deps << line;
    //level["backgroundPalette"] =
    backgroundPaletteFile = line = ts.readLine();
    deps << line;
    level["placement"] = line = ts.readLine();
    deps << line;

    line = ts.readLine();
    if (type == 4) {
        level["navigation"] = line ;
        deps << line;
    }
    level["music"] = line = ts.readLine();

    // for reading fog
    ts.readLine();
    // for luminance map
    ts.readLine();

   sl = ts.readLine().split(',');
    level["lightDirection"] = (QJsonArray()
                                << sl[0].toFloat() / NORMAL_UNIT
                                << sl[1].toFloat() / NORMAL_UNIT
                                << sl[2].toFloat() / NORMAL_UNIT
               );
    level["ambientLight"] = ts.readLine().toFloat() / LIGHT_UNIT;
    sl = ts.readLine().split(',');
    level["chamberLightDirection"] = (QJsonArray()
                                        << sl[0].toFloat() / NORMAL_UNIT
                                        << sl[1].toFloat() / NORMAL_UNIT
                                        << sl[2].toFloat() / NORMAL_UNIT
                );
    level["chamberAmbientLight"] = ts.readLine().toFloat() / LIGHT_UNIT;



}

QByteArray LevelFile::convert()
{
    QJsonDocument doc(level);
    return doc.toJson();
}

QStringList LevelFile::dependencies()
{
    return deps;
}

void LevelFile::exportLevel(QString dir)
{
    QStringList allDeps = getAllDependencies();
    QStringList foundFiles;
    // first, we will finalize level file

    // let's do briefing
    foundFiles = archive.findFiles("*\\"+level["briefing"].toString());
    TxtFile txtf(archive, foundFiles[0]);
    level["briefing"] = txtf.toJson();
    allDeps.removeAll(foundFiles[0]);

    foundFiles = archive.findFiles("*\\"+level["textures"].toString());
    TexFile texf(archive, foundFiles[0]);
    level["textures"] = texf.toJson();
    allDeps.removeAll(foundFiles[0]);

    foundFiles = archive.findFiles("*\\"+level["powerups"].toString());
    PupFile pupf(archive, foundFiles[0]);
    level["powerups"] = pupf.toJson();
    allDeps.removeAll(foundFiles[0]);

    foundFiles = archive.findFiles("*\\"+level["tunnelDefinition"].toString());
    TdfFile tdff(archive, foundFiles[0]);
    level["tunnelDefinition"] = tdff.toJson();
    allDeps.removeAll(foundFiles[0]);

    foundFiles = archive.findFiles("*\\"+level["placement"].toString());
    DefFile deff(archive, foundFiles[0]);
    level["placement"] = deff.toJson();
    allDeps.removeAll(foundFiles[0]);

    if (level.contains("navigation")) {
        foundFiles = archive.findFiles("*\\"+level["navigation"].toString());
        NavFile navf(archive, foundFiles[0]);
        level["navigation"] = navf.toJson();
        allDeps.removeAll(foundFiles[0]);
    }

    if (level.contains("tunnel")) {
        foundFiles = archive.findFiles("*\\"+level["tunnel"].toString());
        TnlFile tnlf(archive, foundFiles[0]);
        level["tunnel"] = tnlf.toJson();
        allDeps.removeAll(foundFiles[0]);
    }

    QFileInfo fi(dir + QDir::separator() + filePath + ".json");
    QDir::root().mkpath(fi.absolutePath());

    QFile file(fi.absoluteFilePath());
    if (file.open(QFile::WriteOnly)) {
        QJsonDocument doc(level);
        file.write(doc.toJson());
        file.close();
    }

    //std::cout << qPrintable(allDeps.join(',')) << std::endl;
    // paletteFile
    ActFile af(archive, archive.findFiles("*\\"+paletteFile)[0]);
    ActFile afc(archive, archive.findFiles("*\\"+ backgroundPaletteFile)[0]);
    afc.shiftColors(48);

    QString cloudString = archive.findFiles("*\\"+level["clouds"].toString())[0].replace('\\',QDir::separator());

    for(QString fn : allDeps) {
        //std::cout << "file " << qPrintable(fn) << std::endl;

        if (fn.endsWith("RAW")) {
            // here we will extract raw files
            // we shall use palette for this.
            RawFile rf(archive, fn);
            QFileInfo firaw(dir + QDir::separator() + fn.replace('\\', QDir::separator()) + ".png");
            QDir::root().mkpath(firaw.absolutePath());


            if (cloudString == fn) {
                rf.setPalette(afc.getPalette());
            } else {
                rf.setPalette(af.getPalette());
            }
            rf.getImage().save(firaw.absoluteFilePath());
        } else {
            // we will ignore level files
            if (!fn.endsWith("LVL")) {
                QFileInfo fifile(dir + QDir::separator() + fn.replace('\\', QDir::separator()) );
                QDir::root().mkpath(fifile.absolutePath());
                archive.extractFile(fn, fifile.absoluteFilePath());
            }
        }

    }

    if(level.contains("heightmap")) {
        QString fn = archive.findFiles("*\\"+level["heightmap"].toString())[0];
        QFileInfo fifile(dir + QDir::separator() + fn.replace('\\', QDir::separator()) );
        QDir::root().mkpath(fifile.absolutePath());
        archive.extractFile(fn, fifile.absoluteFilePath());
    }

}
