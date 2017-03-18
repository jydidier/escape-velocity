#ifndef BINFILE_H
#define BINFILE_H
#include <podfile.h>
#include <podarchive.h>

class BinFile : public PodFile
{
public:
    BinFile(PodArchive& arch, QString path);
};

#endif // BINFILE_H
