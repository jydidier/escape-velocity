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

int LevelFile::fileTypeId = PodFile::registerLoader("LVL", fileLoader<LevelFile>);

LevelFile::LevelFile(PodArchive &arch, QString path) : PodFile(arch, path)
{
    QTextStream ts(data, QIODevice::ReadOnly);
    QStringList sl;
    QString line;

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
        level["texture_placement"] = line;
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
    level["tunnel_definition"] = line = ts.readLine();
    deps << line;
    level["cloud_texture"] = line = ts.readLine();
    deps << line;
    level["background_palette"] = line = ts.readLine();
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
    level["light_direction"] = (QJsonArray()
                                << sl[0].toFloat() / NORMAL_UNIT
                                << sl[1].toFloat() / NORMAL_UNIT
                                << sl[2].toFloat() / NORMAL_UNIT
               );
    level["ambient_light"] = ts.readLine().toFloat() / LIGHT_UNIT;
    sl = ts.readLine().split(',');
    level["chamber_light_direction"] = (QJsonArray()
                                        << sl[0].toFloat() / NORMAL_UNIT
                                        << sl[1].toFloat() / NORMAL_UNIT
                                        << sl[2].toFloat() / NORMAL_UNIT
                );
    level["chamber_ambient_light"] = ts.readLine().toFloat() / LIGHT_UNIT;



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
    foundFiles = archive.findFiles("*"+level["briefing"].toString());
    TxtFile txtf(archive, foundFiles[0]);
    level["briefing"] = txtf.toJson();
    allDeps.removeAll(foundFiles[0]);

    foundFiles = archive.findFiles("*"+level["textures"].toString());
    TexFile texf(archive, foundFiles[0]);
    level["textures"] = texf.toJson();
    allDeps.removeAll(foundFiles[0]);

    foundFiles = archive.findFiles("*"+level["powerups"].toString());
    PupFile pupf(archive, foundFiles[0]);
    level["powerups"] = pupf.toJson();
    allDeps.removeAll(foundFiles[0]);

    foundFiles = archive.findFiles("*"+level["tunnel_definition"].toString());
    TdfFile tdff(archive, foundFiles[0]);
    level["tunnel_definition"] = tdff.toJson();
    allDeps.removeAll(foundFiles[0]);

    foundFiles = archive.findFiles("*"+level["placement"].toString());
    DefFile deff(archive, foundFiles[0]);
    level["placement"] = deff.toJson();
    allDeps.removeAll(foundFiles[0]);

    if (!level["navigation"].isUndefined()) {
        foundFiles = archive.findFiles("*"+level["navigation"].toString());
        NavFile navf(archive, foundFiles[0]);
        level["navigation"] = navf.toJson();
        allDeps.removeAll(foundFiles[0]);
    }

    if (!level["tunnel"].isUndefined()) {
        foundFiles = archive.findFiles("*"+level["tunnel"].toString());
        TnlFile tnlf(archive, foundFiles[0]);
        level["tunnel"] = tnlf.toJson();
        allDeps.removeAll(foundFiles[0]);
    }

    QFile file(dir);
    if (file.open(QFile::WriteOnly)) {
        QJsonDocument doc(level);
        file.write(doc.toJson());
        file.close();
    }

    std::cout << qPrintable(allDeps.join(',')) << std::endl;

    for(QString fn : allDeps) {
        if (fn.endsWith("RAW")) {
            // here we will extract raw files
            // we shall use palette for this.

        } else {
            // we will ignore level files
            if (!fn.endsWith("LVL")) {

            }
        }

    }

}
