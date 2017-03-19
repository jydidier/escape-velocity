#include "tnlfile.h"
#include <QTextStream>
#include <QJsonObject>
#include <QJsonDocument>

TnlFile::TnlFile(PodArchive &arch, QString path) : PodFile(arch, path)
{
    QTextStream ts(data, QIODevice::ReadOnly);

    int numSegments = ts.readLine().toInt();

    for (int i=0; i<numSegments; i++ ) {
        QJsonObject segment;

        QJsonObject start;
        QJsonObject end;
        QJsonObject light;
        QJsonObject polygons;
    }


}

QByteArray TnlFile::convert()
{
    QJsonDocument doc(segments);
    return doc.toJson();
}

const QStringList TnlFile::dependencies()
{

}
