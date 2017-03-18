#ifndef LEVELFILE_H
#define LEVELFILE_H

#include <podfile.h>
#include <podarchive.h>

class LevelFile : public PodFile
{
public:
    LevelFile(PodArchive& arch, QString path);
};

#endif // LEVELFILE_H
