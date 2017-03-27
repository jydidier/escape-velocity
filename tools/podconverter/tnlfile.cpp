#include "tnlfile.h"
#include <QTextStream>
#include <QJsonObject>
#include <QJsonDocument>
#include <QStringList>

#include <units.h>

int TnlFile::fileTypeId = PodFile::registerLoader("TNL", fileLoader<TnlFile>);


TnlFile::TnlFile(PodArchive &arch, QString path) : PodFile(arch, path)
{
    QTextStream ts(data, QIODevice::ReadOnly);

    int numSegments = ts.readLine().toInt();
    int numPolygons;
    QStringList sl;

    for (int i=0; i<numSegments; i++ ) {
        QJsonObject segment;

        QJsonObject start;
        QJsonObject end;
        QJsonObject light;
        QJsonArray polygons;

        sl = ts.readLine().split(',');
        start["x"] = sl[0].toFloat() / DISTANCE_UNIT;
        start["y"] = sl[1].toFloat() / DISTANCE_UNIT;
        end["x"] = sl[2].toFloat() / DISTANCE_UNIT;
        end["y"] = sl[3].toFloat() / DISTANCE_UNIT;
        numPolygons = sl[4].toInt();

        sl = ts.readLine().split(',');
        start["angle1"] = sl[0].toFloat() / ANGLE_UNIT;
        start["angle2"] = sl[1].toFloat() / ANGLE_UNIT;

        segment["rotationSpeed"] = sl[2].toFloat() / ANGLE_UNIT;

        sl = ts.readLine().split(',');
        start["width"] = sl[0].toFloat();
        start["height"] = sl[1].toFloat();

        sl = ts.readLine().split(',');
        end["angle1"] = sl[0].toFloat();
        end["angle2"] = sl[1].toFloat();

        sl = ts.readLine().split(',');
        end["width"] = sl[0].toFloat();
        end["height"] = sl[1].toFloat();

        ts.readLine();
        light["source"] = ts.readLine().toInt();
        segment["cutout"] = ts.readLine().toInt() != 0;
        segment["obstacle"] = ts.readLine().toInt();
        segment["obstacle_texture"] = ts.readLine().toInt();

        for(int j=0; j< numPolygons; j++) {
            polygons << ts.readLine().toInt();
        }

        light["flickerType"] = ts.readLine().toInt();
        light["flickerStrength"] = ts.readLine().toFloat() / LIGHT_UNIT;
        light["ambient"] = ts.readLine().toFloat() / LIGHT_UNIT;

        segment["start"] = start;
        segment["end"] = end;
        segment["light"] = light;
        segment["polygons"] = polygons;

        segments << segment;
    }


}

QByteArray TnlFile::convert()
{
    QJsonDocument doc(segments);
    return doc.toJson();
}

/*const QStringList TnlFile::dependencies()
{

}*/
