var node_fs_stats_1 = require('../core/node_fs_stats');
var path = require('path');
var FileIndex = (function () {
    function FileIndex() {
        this._index = {};
        this.addPath('/', new DirInode());
    }
    FileIndex.prototype._split_path = function (p) {
        var dirpath = path.dirname(p);
        var itemname = p.substr(dirpath.length + (dirpath === "/" ? 0 : 1));
        return [dirpath, itemname];
    };
    FileIndex.prototype.fileIterator = function (cb) {
        for (var path in this._index) {
            var dir = this._index[path];
            var files = dir.getListing();
            for (var i = 0; i < files.length; i++) {
                var item = dir.getItem(files[i]);
                if (isFileInode(item)) {
                    cb(item.getData());
                }
            }
        }
    };
    FileIndex.prototype.addPath = function (path, inode) {
        if (inode == null) {
            throw new Error('Inode must be specified');
        }
        if (path[0] !== '/') {
            throw new Error('Path must be absolute, got: ' + path);
        }
        if (this._index.hasOwnProperty(path)) {
            return this._index[path] === inode;
        }
        var splitPath = this._split_path(path);
        var dirpath = splitPath[0];
        var itemname = splitPath[1];
        var parent = this._index[dirpath];
        if (parent === undefined && path !== '/') {
            parent = new DirInode();
            if (!this.addPath(dirpath, parent)) {
                return false;
            }
        }
        if (path !== '/') {
            if (!parent.addItem(itemname, inode)) {
                return false;
            }
        }
        if (isDirInode(inode)) {
            this._index[path] = inode;
        }
        return true;
    };
    FileIndex.prototype.removePath = function (path) {
        var splitPath = this._split_path(path);
        var dirpath = splitPath[0];
        var itemname = splitPath[1];
        var parent = this._index[dirpath];
        if (parent === undefined) {
            return null;
        }
        var inode = parent.remItem(itemname);
        if (inode === null) {
            return null;
        }
        if (isDirInode(inode)) {
            var children = inode.getListing();
            for (var i = 0; i < children.length; i++) {
                this.removePath(path + '/' + children[i]);
            }
            if (path !== '/') {
                delete this._index[path];
            }
        }
        return inode;
    };
    FileIndex.prototype.ls = function (path) {
        var item = this._index[path];
        if (item === undefined) {
            return null;
        }
        return item.getListing();
    };
    FileIndex.prototype.getInode = function (path) {
        var splitPath = this._split_path(path);
        var dirpath = splitPath[0];
        var itemname = splitPath[1];
        var parent = this._index[dirpath];
        if (parent === undefined) {
            return null;
        }
        if (dirpath === path) {
            return parent;
        }
        return parent.getItem(itemname);
    };
    FileIndex.fromListing = function (listing) {
        var idx = new FileIndex();
        var rootInode = new DirInode();
        idx._index['/'] = rootInode;
        var queue = [['', listing, rootInode]];
        while (queue.length > 0) {
            var inode;
            var next = queue.pop();
            var pwd = next[0];
            var tree = next[1];
            var parent = next[2];
            for (var node in tree) {
                var children = tree[node];
                var name = "" + pwd + "/" + node;
                if (children != null) {
                    idx._index[name] = inode = new DirInode();
                    queue.push([name, children, inode]);
                }
                else {
                    inode = new FileInode(new node_fs_stats_1.default(node_fs_stats_1.FileType.FILE, -1, 0x16D));
                }
                if (parent != null) {
                    parent._ls[node] = inode;
                }
            }
        }
        return idx;
    };
    return FileIndex;
})();
exports.FileIndex = FileIndex;
var FileInode = (function () {
    function FileInode(data) {
        this.data = data;
    }
    FileInode.prototype.isFile = function () { return true; };
    FileInode.prototype.isDir = function () { return false; };
    FileInode.prototype.getData = function () { return this.data; };
    FileInode.prototype.setData = function (data) { this.data = data; };
    return FileInode;
})();
exports.FileInode = FileInode;
var DirInode = (function () {
    function DirInode() {
        this._ls = {};
    }
    DirInode.prototype.isFile = function () {
        return false;
    };
    DirInode.prototype.isDir = function () {
        return true;
    };
    DirInode.prototype.getStats = function () {
        return new node_fs_stats_1.default(node_fs_stats_1.FileType.DIRECTORY, 4096, 0x16D);
    };
    DirInode.prototype.getListing = function () {
        return Object.keys(this._ls);
    };
    DirInode.prototype.getItem = function (p) {
        var _ref;
        return (_ref = this._ls[p]) != null ? _ref : null;
    };
    DirInode.prototype.addItem = function (p, inode) {
        if (p in this._ls) {
            return false;
        }
        this._ls[p] = inode;
        return true;
    };
    DirInode.prototype.remItem = function (p) {
        var item = this._ls[p];
        if (item === undefined) {
            return null;
        }
        delete this._ls[p];
        return item;
    };
    return DirInode;
})();
exports.DirInode = DirInode;
function isFileInode(inode) {
    return inode && inode.isFile();
}
exports.isFileInode = isFileInode;
function isDirInode(inode) {
    return inode && inode.isDir();
}
exports.isDirInode = isDirInode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZV9pbmRleC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9nZW5lcmljL2ZpbGVfaW5kZXgudHMiXSwibmFtZXMiOlsiRmlsZUluZGV4IiwiRmlsZUluZGV4LmNvbnN0cnVjdG9yIiwiRmlsZUluZGV4Ll9zcGxpdF9wYXRoIiwiRmlsZUluZGV4LmZpbGVJdGVyYXRvciIsIkZpbGVJbmRleC5hZGRQYXRoIiwiRmlsZUluZGV4LnJlbW92ZVBhdGgiLCJGaWxlSW5kZXgubHMiLCJGaWxlSW5kZXguZ2V0SW5vZGUiLCJGaWxlSW5kZXguZnJvbUxpc3RpbmciLCJGaWxlSW5vZGUiLCJGaWxlSW5vZGUuY29uc3RydWN0b3IiLCJGaWxlSW5vZGUuaXNGaWxlIiwiRmlsZUlub2RlLmlzRGlyIiwiRmlsZUlub2RlLmdldERhdGEiLCJGaWxlSW5vZGUuc2V0RGF0YSIsIkRpcklub2RlIiwiRGlySW5vZGUuY29uc3RydWN0b3IiLCJEaXJJbm9kZS5pc0ZpbGUiLCJEaXJJbm9kZS5pc0RpciIsIkRpcklub2RlLmdldFN0YXRzIiwiRGlySW5vZGUuZ2V0TGlzdGluZyIsIkRpcklub2RlLmdldEl0ZW0iLCJEaXJJbm9kZS5hZGRJdGVtIiwiRGlySW5vZGUucmVtSXRlbSIsImlzRmlsZUlub2RlIiwiaXNEaXJJbm9kZSJdLCJtYXBwaW5ncyI6IkFBQUEsOEJBQXlDLHVCQUF1QixDQUFDLENBQUE7QUFDakUsSUFBTyxJQUFJLFdBQVcsTUFBTSxDQUFDLENBQUM7QUFTOUI7SUFPRUE7UUFHRUMsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsRUFBRUEsQ0FBQ0E7UUFFakJBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLEdBQUdBLEVBQUVBLElBQUlBLFFBQVFBLEVBQUVBLENBQUNBLENBQUNBO0lBQ3BDQSxDQUFDQTtJQUtPRCwrQkFBV0EsR0FBbkJBLFVBQW9CQSxDQUFTQTtRQUMzQkUsSUFBSUEsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0Es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QUFRQSxDQUFDQSxDQUFDQTtRQUNyQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkJBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2RBLENBQUNBO1FBRURBLEVBQUVBLENBQUNBLENBQUNBLFVBQVVBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3RCQSxJQUFJQSxRQUFRQSxHQUFHQSxLQUFLQSxDQUFDQSxVQUFVQSxFQUFFQSxDQUFDQTtZQUNsQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsUUFBUUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0E7Z0JBQ3pDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxJQUFJQSxHQUFHQSxHQUFHQSxHQUFHQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1Q0EsQ0FBQ0E7WUFHREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2pCQSxPQUFPQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUMzQkEsQ0FBQ0E7UUFDSEEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7SUFDZkEsQ0FBQ0E7SUFPTUwsc0JBQUVBLEdBQVRBLFVBQVVBLElBQVlBO1FBQ3BCTSxJQUFJQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUM3QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkJBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2RBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLEVBQUVBLENBQUNBO0lBQzNCQSxDQUFDQTtJQVFNTiw0QkFBUUEsR0FBZkEsVUFBZ0JBLElBQVlBO1FBQzFCTyxJQUFJQSxTQUFTQSxHQUFHQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUN2Q0EsSUFBSUEsT0FBT0EsR0FBR0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDM0JBLElBQUlBLFFBQVFBLEdBQUdBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBRTVCQSxJQUFJQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUNsQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsS0FBS0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDekJBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2RBLENBQUNBO1FBRURBLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLEtBQUtBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQ3JCQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQTtRQUNoQkEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7SUFDbENBLENBQUNBO0lBT2FQLHFCQUFXQSxHQUF6QkEsVUFBMEJBLE9BQU9BO1FBQy9CUSxJQUFJQSxHQUFHQSxHQUFHQSxJQUFJQSxTQUFTQSxFQUFFQSxDQUFDQTtRQUUxQkEsSUFBSUEsU0FBU0EsR0FBR0EsSUFBSUEsUUFBUUEsRUFBRUEsQ0FBQ0E7UUFDL0JBLEdBQUdBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLFNBQVNBLENBQUNBO1FBQzVCQSxJQUFJQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQSxFQUFFQSxFQUFFQSxPQUFPQSxFQUFFQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUN2Q0EsT0FBT0EsS0FBS0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0E7WUFDeEJBLElBQUlBLEtBQUtBLENBQUNBO1lBQ1ZBLElBQUlBLElBQUlBLEdBQUdBLEtBQUtBLENBQUNBLEdBQUdBLEVBQUVBLENBQUNBO1lBQ3ZCQSxJQUFJQSxHQUFHQSxHQUFHQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsQkEsSUFBSUEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkJBLElBQUlBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3JCQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxJQUFJQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDdEJBLElBQUlBLFFBQVFBLEdBQUdBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO2dCQUMxQkEsSUFBSUEsSUFBSUEsR0FBR0EsRUFBRUEsR0FBR0EsR0FBR0EsR0FBR0EsR0FBR0EsR0FBR0EsSUFBSUEsQ0FBQ0E7Z0JBQ2pDQSxFQUFFQSxDQUFDQSxDQUFDQSxRQUFRQSxJQUFJQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDckJBLEdBQUdBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLEtBQUtBLEdBQUdBLElBQUlBLFFBQVFBLEVBQUVBLENBQUNBO29CQUMxQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsRUFBRUEsUUFBUUEsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3RDQSxDQUFDQTtnQkFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7b0JBRU5BLEtBQUtBLEdBQUdBLElBQUlBLFNBQVNBLENBQVFBLElBQUlBLHVCQUFLQSxDQUFDQSx3QkFBUUEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3BFQSxDQUFDQTtnQkFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsSUFBSUEsSUFB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QUFDQTtBQUFEQSxDQUFDQSxBQXBFRCxJQW9FQztBQXBFWSxnQkFBUSxXQW9FcEIsQ0FBQTtBQUVELHFCQUErQixLQUFZO0lBQ3pDUyxNQUFNQSxDQUFDQSxLQUFLQSxJQUFJQSxLQUFLQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQTtBQUNqQ0EsQ0FBQ0E7QUFGZSxtQkFBVyxjQUUxQixDQUFBO0FBRUQsb0JBQTJCLEtBQVk7SUFDckNDLE1BQU1BLENBQUNBLEtBQUtBLElBQUlBLEtBQUtBLENBQUNBLEtBQUtBLEVBQUVBLENBQUNBO0FBQ2hDQSxDQUFDQTtBQUZlLGtCQUFVLGFBRXpCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2RlZmF1bHQgYXMgU3RhdHMsIEZpbGVUeXBlfSBmcm9tICcuLi9jb3JlL25vZGVfZnNfc3RhdHMnO1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbi8qKlxuICogQSBzaW1wbGUgY2xhc3MgZm9yIHN0b3JpbmcgYSBmaWxlc3lzdGVtIGluZGV4LiBBc3N1bWVzIHRoYXQgYWxsIHBhdGhzIHBhc3NlZFxuICogdG8gaXQgYXJlICphYnNvbHV0ZSogcGF0aHMuXG4gKlxuICogQ2FuIGJlIHVzZWQgYXMgYSBwYXJ0aWFsIG9yIGEgZnVsbCBpbmRleCwgYWx0aG91Z2ggY2FyZSBtdXN0IGJlIHRha2VuIGlmIHVzZWRcbiAqIGZvciB0aGUgZm9ybWVyIHB1cnBvc2UsIGVzcGVjaWFsbHkgd2hlbiBkaXJlY3RvcmllcyBhcmUgY29uY2VybmVkLlxuICovXG5leHBvcnQgY2xhc3MgRmlsZUluZGV4IHtcbiAgLy8gTWFwcyBkaXJlY3RvcnkgcGF0aHMgdG8gZGlyZWN0b3J5IGlub2Rlcywgd2hpY2ggY29udGFpbiBmaWxlcy5cbiAgcHJpdmF0ZSBfaW5kZXg6IHtbcGF0aDogc3RyaW5nXTogRGlySW5vZGV9XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdHMgYSBuZXcgRmlsZUluZGV4LlxuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgLy8gX2luZGV4IGlzIGEgc2luZ2xlLWxldmVsIGtleSx2YWx1ZSBzdG9yZSB0aGF0IG1hcHMgKmRpcmVjdG9yeSogcGF0aHMgdG9cbiAgICAvLyBEaXJJbm9kZXMuIEZpbGUgaW5mb3JtYXRpb24gaXMgb25seSBjb250YWluZWQgaW4gRGlySW5vZGVzIHRoZW1zZWx2ZXMuXG4gICAgdGhpcy5faW5kZXggPSB7fTtcbiAgICAvLyBDcmVhdGUgdGhlIHJvb3QgZGlyZWN0b3J5LlxuICAgIHRoaXMuYWRkUGF0aCgnLycsIG5ldyBEaXJJbm9kZSgpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTcGxpdCBpbnRvIGEgKGRpcmVjdG9yeSBwYXRoLCBpdGVtIG5hbWUpIHBhaXJcbiAgICovXG4gIHByaXZhdGUgX3NwbGl0X3BhdGgocDogc3RyaW5nKTogc3RyaW5nW10ge1xuICAgIHZhciBkaXJwYXRoID0gcGF0aC5kaXJuYW1lKHApO1xuICAgIHZhciBpdGVtbmFtZSA9IHAuc3Vic3RyKGRpcnBhdGgubGVuZ3RoICsgKGRpcnBhdGggPT09IFwiL1wiID8gMCA6IDEpKTtcbiAgICByZXR1cm4gW2RpcnBhdGgsIGl0ZW1uYW1lXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIHRoZSBnaXZlbiBmdW5jdGlvbiBvdmVyIGFsbCBmaWxlcyBpbiB0aGUgaW5kZXguXG4gICAqL1xuICBwdWJsaWMgZmlsZUl0ZXJhdG9yPFQ+KGNiOiAoZmlsZTogVCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIGZvciAodmFyIHBhdGggaW4gdGhpcy5faW5kZXgpIHtcbiAgICAgIHZhciBkaXIgPSB0aGlzLl9pbmRleFtwYXRoXTtcbiAgICAgIHZhciBmaWxlcyA9IGRpci5nZXRMaXN0aW5nKCk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZpbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBpdGVtID0gZGlyLmdldEl0ZW0oZmlsZXNbaV0pO1xuICAgICAgICBpZiAoaXNGaWxlSW5vZGU8VD4oaXRlbSkpIHtcbiAgICAgICAgICBjYihpdGVtLmdldERhdGEoKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkcyB0aGUgZ2l2ZW4gYWJzb2x1dGUgcGF0aCB0byB0aGUgaW5kZXggaWYgaXQgaXMgbm90IGFscmVhZHkgaW4gdGhlIGluZGV4LlxuICAgKiBDcmVhdGVzIGFueSBuZWVkZWQgcGFyZW50IGRpcmVjdG9yaWVzLlxuICAgKiBAcGFyYW0gW1N0cmluZ10gcGF0aCBUaGUgcGF0aCB0byBhZGQgdG8gdGhlIGluZGV4LlxuICAgKiBAcGFyYW0gW0Jyb3dzZXJGUy5GaWxlSW5vZGUgfCBCcm93c2VyRlMuRGlySW5vZGVdIGlub2RlIFRoZSBpbm9kZSBmb3IgdGhlXG4gICAqICAgcGF0aCB0byBhZGQuXG4gICAqIEByZXR1cm4gW0Jvb2xlYW5dICdUcnVlJyBpZiBpdCB3YXMgYWRkZWQgb3IgYWxyZWFkeSBleGlzdHMsICdmYWxzZScgaWYgdGhlcmVcbiAgICogICB3YXMgYW4gaXNzdWUgYWRkaW5nIGl0IChlLmcuIGl0ZW0gaW4gcGF0aCBpcyBhIGZpbGUsIGl0ZW0gZXhpc3RzIGJ1dCBpc1xuICAgKiAgIGRpZmZlcmVudCkuXG4gICAqIEB0b2RvIElmIGFkZGluZyBmYWlscyBhbmQgaW1wbGljaXRseSBjcmVhdGVzIGRpcmVjdG9yaWVzLCB3ZSBkbyBub3QgY2xlYW4gdXBcbiAgICogICB0aGUgbmV3IGVtcHR5IGRpcmVjdG9yaWVzLlxuICAgKi9cbiAgcHVibGljIGFkZFBhdGgocGF0aDogc3RyaW5nLCBpbm9kZTogSW5vZGUpOiBib29sZWFuIHtcbiAgICBpZiAoaW5vZGUgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbm9kZSBtdXN0IGJlIHNwZWNpZmllZCcpO1xuICAgIH1cbiAgICBpZiAocGF0aFswXSAhPT0gJy8nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BhdGggbXVzdCBiZSBhYnNvbHV0ZSwgZ290OiAnICsgcGF0aCk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgaWYgaXQgYWxyZWFkeSBleGlzdHMuXG4gICAgaWYgKHRoaXMuX2luZGV4Lmhhc093blByb3BlcnR5KHBhdGgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5faW5kZXhbcGF0aF0gPT09IGlub2RlO1xuICAgIH1cblxuICAgIHZhciBzcGxpdFBhdGggPSB0aGlzLl9zcGxpdF9wYXRoKHBhdGgpO1xuICAgIHZhciBkaXJwYXRoID0gc3BsaXRQYXRoWzBdO1xuICAgIHZhciBpdGVtbmFtZSA9IHNwbGl0UGF0aFsxXTtcbiAgICAvLyBUcnkgdG8gYWRkIHRvIGl0cyBwYXJlbnQgZGlyZWN0b3J5IGZpcnN0LlxuICAgIHZhciBwYXJlbnQgPSB0aGlzLl9pbmRleFtkaXJwYXRoXTtcbiAgICBpZiAocGFyZW50ID09PSB1bmRlZmluZWQgJiYgcGF0aCAhPT0gJy8nKSB7XG4gICAgICAvLyBDcmVhdGUgcGFyZW50LlxuICAgICAgcGFyZW50ID0gbmV3IERpcklub2RlKCk7XG4gICAgICBpZiAoIXRoaXMuYWRkUGF0aChkaXJwYXRoLCBwYXJlbnQpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gQWRkIG15c2VsZiB0byBteSBwYXJlbnQuXG4gICAgaWYgKHBhdGggIT09ICcvJykge1xuICAgICAgaWYgKCFwYXJlbnQuYWRkSXRlbShpdGVtbmFtZSwgaW5vZGUpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gSWYgSSdtIGEgZGlyZWN0b3J5LCBhZGQgbXlzZWxmIHRvIHRoZSBpbmRleC5cbiAgICBpZiAoaXNEaXJJbm9kZShpbm9kZSkpIHtcbiAgICAgIHRoaXMuX2luZGV4W3BhdGhdID0gaW5vZGU7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIGdpdmVuIHBhdGguIENhbiBiZSBhIGZpbGUgb3IgYSBkaXJlY3RvcnkuXG4gICAqIEByZXR1cm4gW0Jyb3dzZXJGUy5GaWxlSW5vZGUgfCBCcm93c2VyRlMuRGlySW5vZGUgfCBudWxsXSBUaGUgcmVtb3ZlZCBpdGVtLFxuICAgKiAgIG9yIG51bGwgaWYgaXQgZGlkIG5vdCBleGlzdC5cbiAgICovXG4gIHB1YmxpYyByZW1vdmVQYXRoKHBhdGg6IHN0cmluZyk6IElub2RlIHtcbiAgICB2YXIgc3BsaXRQYXRoID0gdGhpcy5fc3BsaXRfcGF0aChwYXRoKTtcbiAgICB2YXIgZGlycGF0aCA9IHNwbGl0UGF0aFswXTtcbiAgICB2YXIgaXRlbW5hbWUgPSBzcGxpdFBhdGhbMV07XG5cbiAgICAvLyBUcnkgdG8gcmVtb3ZlIGl0IGZyb20gaXRzIHBhcmVudCBkaXJlY3RvcnkgZmlyc3QuXG4gICAgdmFyIHBhcmVudCA9IHRoaXMuX2luZGV4W2RpcnBhdGhdO1xuICAgIGlmIChwYXJlbnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIC8vIFJlbW92ZSBteXNlbGYgZnJvbSBteSBwYXJlbnQuXG4gICAgdmFyIGlub2RlID0gcGFyZW50LnJlbUl0ZW0oaXRlbW5hbWUpO1xuICAgIGlmIChpbm9kZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIC8vIElmIEknbSBhIGRpcmVjdG9yeSwgcmVtb3ZlIG15c2VsZiBmcm9tIHRoZSBpbmRleCwgYW5kIHJlbW92ZSBteSBjaGlsZHJlbi5cbiAgICBpZiAoaXNEaXJJbm9kZShpbm9kZSkpIHtcbiAgICAgIHZhciBjaGlsZHJlbiA9IGlub2RlLmdldExpc3RpbmcoKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpcy5yZW1vdmVQYXRoKHBhdGggKyAnLycgKyBjaGlsZHJlbltpXSk7XG4gICAgICB9XG5cbiAgICAgIC8vIFJlbW92ZSB0aGUgZGlyZWN0b3J5IGZyb20gdGhlIGluZGV4LCB1bmxlc3MgaXQncyB0aGUgcm9vdC5cbiAgICAgIGlmIChwYXRoICE9PSAnLycpIHtcbiAgICAgICAgZGVsZXRlIHRoaXMuX2luZGV4W3BhdGhdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaW5vZGU7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSBkaXJlY3RvcnkgbGlzdGluZyBvZiB0aGUgZ2l2ZW4gcGF0aC5cbiAgICogQHJldHVybiBbU3RyaW5nW11dIEFuIGFycmF5IG9mIGZpbGVzIGluIHRoZSBnaXZlbiBwYXRoLCBvciAnbnVsbCcgaWYgaXQgZG9lc1xuICAgKiAgIG5vdCBleGlzdC5cbiAgICovXG4gIHB1YmxpYyBscyhwYXRoOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gICAgdmFyIGl0ZW0gPSB0aGlzLl9pbmRleFtwYXRoXTtcbiAgICBpZiAoaXRlbSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGl0ZW0uZ2V0TGlzdGluZygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGlub2RlIG9mIHRoZSBnaXZlbiBpdGVtLlxuICAgKiBAcGFyYW0gW1N0cmluZ10gcGF0aFxuICAgKiBAcmV0dXJuIFtCcm93c2VyRlMuRmlsZUlub2RlIHwgQnJvd3NlckZTLkRpcklub2RlIHwgbnVsbF0gUmV0dXJucyBudWxsIGlmXG4gICAqICAgdGhlIGl0ZW0gZG9lcyBub3QgZXhpc3QuXG4gICAqL1xuICBwdWJsaWMgZ2V0SW5vZGUocGF0aDogc3RyaW5nKTogSW5vZGUge1xuICAgIHZhciBzcGxpdFBhdGggPSB0aGlzLl9zcGxpdF9wYXRoKHBhdGgpO1xuICAgIHZhciBkaXJwYXRoID0gc3BsaXRQYXRoWzBdO1xuICAgIHZhciBpdGVtbmFtZSA9IHNwbGl0UGF0aFsxXTtcbiAgICAvLyBSZXRyaWV2ZSBmcm9tIGl0cyBwYXJlbnQgZGlyZWN0b3J5LlxuICAgIHZhciBwYXJlbnQgPSB0aGlzLl9pbmRleFtkaXJwYXRoXTtcbiAgICBpZiAocGFyZW50ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICAvLyBSb290IGNhc2VcbiAgICBpZiAoZGlycGF0aCA9PT0gcGF0aCkge1xuICAgICAgcmV0dXJuIHBhcmVudDtcbiAgICB9XG4gICAgcmV0dXJuIHBhcmVudC5nZXRJdGVtKGl0ZW1uYW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGF0aWMgbWV0aG9kIGZvciBjb25zdHJ1Y3RpbmcgaW5kaWNlcyBmcm9tIGEgSlNPTiBsaXN0aW5nLlxuICAgKiBAcGFyYW0gW09iamVjdF0gbGlzdGluZyBEaXJlY3RvcnkgbGlzdGluZyBnZW5lcmF0ZWQgYnkgdG9vbHMvWEhSSW5kZXhlci5jb2ZmZWVcbiAgICogQHJldHVybiBbQnJvd3NlckZTLkZpbGVJbmRleF0gQSBuZXcgRmlsZUluZGV4IG9iamVjdC5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZnJvbUxpc3RpbmcobGlzdGluZyk6IEZpbGVJbmRleCB7XG4gICAgdmFyIGlkeCA9IG5ldyBGaWxlSW5kZXgoKTtcbiAgICAvLyBBZGQgYSByb290IERpck5vZGUuXG4gICAgdmFyIHJvb3RJbm9kZSA9IG5ldyBEaXJJbm9kZSgpO1xuICAgIGlkeC5faW5kZXhbJy8nXSA9IHJvb3RJbm9kZTtcbiAgICB2YXIgcXVldWUgPSBbWycnLCBsaXN0aW5nLCByb290SW5vZGVdXTtcbiAgICB3aGlsZSAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIGlub2RlO1xuICAgICAgdmFyIG5leHQgPSBxdWV1ZS5wb3AoKTtcbiAgICAgIHZhciBwd2QgPSBuZXh0WzBdO1xuICAgICAgdmFyIHRyZWUgPSBuZXh0WzFdO1xuICAgICAgdmFyIHBhcmVudCA9IG5leHRbMl07XG4gICAgICBmb3IgKHZhciBub2RlIGluIHRyZWUpIHtcbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdHJlZVtub2RlXTtcbiAgICAgICAgdmFyIG5hbWUgPSBcIlwiICsgcHdkICsgXCIvXCIgKyBub2RlO1xuICAgICAgICBpZiAoY2hpbGRyZW4gIT0gbnVsbCkge1xuICAgICAgICAgIGlkeC5faW5kZXhbbmFtZV0gPSBpbm9kZSA9IG5ldyBEaXJJbm9kZSgpO1xuICAgICAgICAgIHF1ZXVlLnB1c2goW25hbWUsIGNoaWxkcmVuLCBpbm9kZV0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFRoaXMgaW5vZGUgZG9lc24ndCBoYXZlIGNvcnJlY3Qgc2l6ZSBpbmZvcm1hdGlvbiwgbm90ZWQgd2l0aCAtMS5cbiAgICAgICAgICBpbm9kZSA9IG5ldyBGaWxlSW5vZGU8U3RhdHM+KG5ldyBTdGF0cyhGaWxlVHlwZS5GSUxFLCAtMSwgMHgxNkQpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFyZW50ICE9IG51bGwpIHtcbiAgICAgICAgICBwYXJlbnQuX2xzW25vZGVdID0gaW5vZGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGlkeDtcbiAgfVxufVxuXG4vKipcbiAqIEdlbmVyaWMgaW50ZXJmYWNlIGZvciBmaWxlL2RpcmVjdG9yeSBpbm9kZXMuXG4gKiBOb3RlIHRoYXQgU3RhdHMgb2JqZWN0cyBhcmUgd2hhdCB3ZSB1c2UgZm9yIGZpbGUgaW5vZGVzLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIElub2RlIHtcbiAgLy8gSXMgdGhpcyBhbiBpbm9kZSBmb3IgYSBmaWxlP1xuICBpc0ZpbGUoKTogYm9vbGVhbjtcbiAgLy8gSXMgdGhpcyBhbiBpbm9kZSBmb3IgYSBkaXJlY3Rvcnk/XG4gIGlzRGlyKCk6IGJvb2xlYW47XG59XG5cbi8qKlxuICogSW5vZGUgZm9yIGEgZmlsZS4gU3RvcmVzIGFuIGFyYml0cmFyeSAoZmlsZXN5c3RlbS1zcGVjaWZpYykgZGF0YSBwYXlsb2FkLlxuICovXG5leHBvcnQgY2xhc3MgRmlsZUlub2RlPFQ+IGltcGxlbWVudHMgSW5vZGUge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGRhdGE6IFQpIHsgfVxuICBwdWJsaWMgaXNGaWxlKCk6IGJvb2xlYW4geyByZXR1cm4gdHJ1ZTsgfVxuICBwdWJsaWMgaXNEaXIoKTogYm9vbGVhbiB7IHJldHVybiBmYWxzZTsgfVxuICBwdWJsaWMgZ2V0RGF0YSgpOiBUIHsgcmV0dXJuIHRoaXMuZGF0YTsgfVxuICBwdWJsaWMgc2V0RGF0YShkYXRhOiBUKTogdm9pZCB7IHRoaXMuZGF0YSA9IGRhdGE7IH1cbn1cblxuLyoqXG4gKiBJbm9kZSBmb3IgYSBkaXJlY3RvcnkuIEN1cnJlbnRseSBvbmx5IGNvbnRhaW5zIHRoZSBkaXJlY3RvcnkgbGlzdGluZy5cbiAqL1xuZXhwb3J0IGNsYXNzIERpcklub2RlIGltcGxlbWVudHMgSW5vZGUge1xuICBwcml2YXRlIF9sczoge1twYXRoOiBzdHJpbmddOiBJbm9kZX0gPSB7fTtcbiAgLyoqXG4gICAqIENvbnN0cnVjdHMgYW4gaW5vZGUgZm9yIGEgZGlyZWN0b3J5LlxuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7fVxuICBwdWJsaWMgaXNGaWxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBwdWJsaWMgaXNEaXIoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGEgU3RhdHMgb2JqZWN0IGZvciB0aGlzIGlub2RlLlxuICAgKiBAdG9kbyBTaG91bGQgcHJvYmFibHkgcmVtb3ZlIHRoaXMgYXQgc29tZSBwb2ludC4gVGhpcyBpc24ndCB0aGVcbiAgICogICAgICAgcmVzcG9uc2liaWxpdHkgb2YgdGhlIEZpbGVJbmRleC5cbiAgICogQHJldHVybiBbQnJvd3NlckZTLm5vZGUuZnMuU3RhdHNdXG4gICAqL1xuICBwdWJsaWMgZ2V0U3RhdHMoKTogU3RhdHMge1xuICAgIHJldHVybiBuZXcgU3RhdHMoRmlsZVR5cGUuRElSRUNUT1JZLCA0MDk2LCAweDE2RCk7XG4gIH1cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGRpcmVjdG9yeSBsaXN0aW5nIGZvciB0aGlzIGRpcmVjdG9yeS4gUGF0aHMgaW4gdGhlIGRpcmVjdG9yeSBhcmVcbiAgICogcmVsYXRpdmUgdG8gdGhlIGRpcmVjdG9yeSdzIHBhdGguXG4gICAqIEByZXR1cm4gW1N0cmluZ1tdXSBUaGUgZGlyZWN0b3J5IGxpc3RpbmcgZm9yIHRoaXMgZGlyZWN0b3J5LlxuICAgKi9cbiAgcHVibGljIGdldExpc3RpbmcoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLl9scyk7XG4gIH1cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGlub2RlIGZvciB0aGUgaW5kaWNhdGVkIGl0ZW0sIG9yIG51bGwgaWYgaXQgZG9lcyBub3QgZXhpc3QuXG4gICAqIEBwYXJhbSBbU3RyaW5nXSBwIE5hbWUgb2YgaXRlbSBpbiB0aGlzIGRpcmVjdG9yeS5cbiAgICogQHJldHVybiBbQnJvd3NlckZTLkZpbGVJbm9kZSB8IEJyb3dzZXJGUy5EaXJJbm9kZSB8IG51bGxdXG4gICAqL1xuICBwdWJsaWMgZ2V0SXRlbShwOiBzdHJpbmcpOiBJbm9kZSB7XG4gICAgdmFyIF9yZWY7XG4gICAgcmV0dXJuIChfcmVmID0gdGhpcy5fbHNbcF0pICE9IG51bGwgPyBfcmVmIDogbnVsbDtcbiAgfVxuICAvKipcbiAgICogQWRkIHRoZSBnaXZlbiBpdGVtIHRvIHRoZSBkaXJlY3RvcnkgbGlzdGluZy4gTm90ZSB0aGF0IHRoZSBnaXZlbiBpbm9kZSBpc1xuICAgKiBub3QgY29waWVkLCBhbmQgd2lsbCBiZSBtdXRhdGVkIGJ5IHRoZSBEaXJJbm9kZSBpZiBpdCBpcyBhIERpcklub2RlLlxuICAgKiBAcGFyYW0gW1N0cmluZ10gcCBJdGVtIG5hbWUgdG8gYWRkIHRvIHRoZSBkaXJlY3RvcnkgbGlzdGluZy5cbiAgICogQHBhcmFtIFtCcm93c2VyRlMuRmlsZUlub2RlIHwgQnJvd3NlckZTLkRpcklub2RlXSBpbm9kZSBUaGUgaW5vZGUgZm9yIHRoZVxuICAgKiAgIGl0ZW0gdG8gYWRkIHRvIHRoZSBkaXJlY3RvcnkgaW5vZGUuXG4gICAqIEByZXR1cm4gW0Jvb2xlYW5dIFRydWUgaWYgaXQgd2FzIGFkZGVkLCBmYWxzZSBpZiBpdCBhbHJlYWR5IGV4aXN0ZWQuXG4gICAqL1xuICBwdWJsaWMgYWRkSXRlbShwOiBzdHJpbmcsIGlub2RlOiBJbm9kZSk6IGJvb2xlYW4ge1xuICAgIGlmIChwIGluIHRoaXMuX2xzKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHRoaXMuX2xzW3BdID0gaW5vZGU7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIGdpdmVuIGl0ZW0gZnJvbSB0aGUgZGlyZWN0b3J5IGxpc3RpbmcuXG4gICAqIEBwYXJhbSBbU3RyaW5nXSBwIE5hbWUgb2YgaXRlbSB0byByZW1vdmUgZnJvbSB0aGUgZGlyZWN0b3J5IGxpc3RpbmcuXG4gICAqIEByZXR1cm4gW0Jyb3dzZXJGUy5GaWxlSW5vZGUgfCBCcm93c2VyRlMuRGlySW5vZGUgfCBudWxsXSBSZXR1cm5zIHRoZSBpdGVtXG4gICAqICAgcmVtb3ZlZCwgb3IgbnVsbCBpZiB0aGUgaXRlbSBkaWQgbm90IGV4aXN0LlxuICAgKi9cbiAgcHVibGljIHJlbUl0ZW0ocDogc3RyaW5nKTogSW5vZGUge1xuICAgIHZhciBpdGVtID0gdGhpcy5fbHNbcF07XG4gICAgaWYgKGl0ZW0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGRlbGV0ZSB0aGlzLl9sc1twXTtcbiAgICByZXR1cm4gaXRlbTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNGaWxlSW5vZGU8VD4oaW5vZGU6IElub2RlKTogaW5vZGUgaXMgRmlsZUlub2RlPFQ+IHtcbiAgcmV0dXJuIGlub2RlICYmIGlub2RlLmlzRmlsZSgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEaXJJbm9kZShpbm9kZTogSW5vZGUpOiBpbm9kZSBpcyBEaXJJbm9kZSB7XG4gIHJldHVybiBpbm9kZSAmJiBpbm9kZS5pc0RpcigpO1xufVxuIl19