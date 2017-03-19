#include "pupfile.h"
#include <QTextStream>
#include <QStringList>
#include <units.h>
#include <QJsonObject>
#include <QJsonDocument>


PupFile::PupFile(PodArchive &arch, QString path) : PodFile(arch, path)
{
    QTextStream ts(data,QIODevice::ReadOnly);

    int numPowerups = ts.readLine().toInt();
    for (int i = 0; i < numPowerups; i++) {
        QStringList sl = ts.readLine().split(',');

        QJsonObject obj;
        obj["type"] = sl[3].toInt();

        obj["position"] = (QJsonArray()
                           << sl[0].toInt() / DISTANCE_UNIT
                           << sl[1].toInt() / DISTANCE_UNIT
                           << sl[2].toInt() / DISTANCE_UNIT);
        objects << obj;
    }
}

QByteArray PupFile::convert()
{
    QJsonDocument doc(objects);
    return doc.toJson();
}
