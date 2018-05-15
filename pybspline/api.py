from bspline import get_points, bspline, bspline_quasi, U_uniform
import sys
import json
import zerorpc


class BsplineApi(object):

    # def calc(self, text):
    #     """based on the input text, return the int result"""
    #     try:
    #         return real_calc(text)
    #     except Exception as e:
    #         return 0.0
    # def __init__(self, k, *args, **kwargs):
    #     self.k = k

    def echo(self, text):
        """echo any text"""
        print(text)
        return text

    # @zerorpc.stream  <=  for iterable
    def draw_spline(self, raw_points, fns):
        # raw_points is list and points[0] is dict
        # raw_points: [{"x":1, "y":2}, {"x":3, "y":4}]
        points = get_points(raw_points)
        # ret = U_uniform(len(raw_points), 3)
        n = len(raw_points) - 1
        # node_vector = U_uniform(n, 3)
        ret = bspline(n, 3, points, fns)

        # return str(type(points[0])), points[0]
        # return points.tolist()
        return ret
        # return n, type(points)
        # return bspline_uniform(n, self.k, points)

    def draw_quasi(self, raw_points):
        points = get_points(raw_points)
        n = len(raw_points) - 1
        ret = bspline_quasi(n, 3, points)
        return ret


def parse_port():
    port = 4243
    try:
        port = int(sys.argv[1])
    except Exception as e:
        pass
    return '{}'.format(port)


def main():
    addr = 'tcp://127.0.0.1:' + parse_port()
    s = zerorpc.Server(BsplineApi())
    s.bind(addr)
    print('start running on {}'.format(addr))
    s.run()

if __name__ == '__main__':
    main()
