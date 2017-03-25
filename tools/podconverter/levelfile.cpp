#include "levelfile.h"

#include <QTextStream>
#include <QJsonArray>
#include <QJsonDocument>
#include <units.h>


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

    level["powerup"] = line = ts.readLine();
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
